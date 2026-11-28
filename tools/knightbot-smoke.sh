#!/usr/bin/env bash
#
# knightbot-smoke.sh
# Smoke test seguro para a KnightBot API.
#
# Uso:
#   export KNIGHTBOT_API_KEY='sua-chave'
#   ./knightbot-smoke.sh
#
# Variáveis opcionais:
#   KNIGHTBOT_BASE_URL       Default: https://knightbotapi.stream
#   KNIGHTBOT_TEST_QUERY     Default: Faded Alan Walker
#   KNIGHTBOT_TEST_YOUTUBE_URL
#                            Default: https://youtu.be/DTbfw8_SMmI
#   KNIGHTBOT_TIMEOUT        Default: 90
#   KNIGHTBOT_VERBOSE        1 para mostrar mais detalhes
#
# O script nunca envia a chave na URL e nunca imprime o valor dela.

set -uo pipefail

BASE_URL="${KNIGHTBOT_BASE_URL:-https://knightbotapi.stream}"
BASE_URL="${BASE_URL%/}"
TEST_QUERY="${KNIGHTBOT_TEST_QUERY:-Faded Alan Walker}"
TEST_YOUTUBE_URL="${KNIGHTBOT_TEST_YOUTUBE_URL:-https://youtu.be/DTbfw8_SMmI}"
TIMEOUT="${KNIGHTBOT_TIMEOUT:-90}"
VERBOSE="${KNIGHTBOT_VERBOSE:-0}"

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0
TOTAL_COUNT=0

TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/knightbot-smoke.XXXXXX")"
trap 'rm -rf "$TMP_DIR"' EXIT

if ! command -v curl >/dev/null 2>&1; then
    echo "ERRO: curl não está instalado ou não está no PATH." >&2
    exit 2
fi

if ! command -v python3 >/dev/null 2>&1; then
    echo "ERRO: python3 é necessário para validar respostas JSON." >&2
    exit 2
fi

if [[ -z "${KNIGHTBOT_API_KEY:-}" ]]; then
    echo "AVISO: KNIGHTBOT_API_KEY não está definida." >&2
    echo "      Os testes sem chave serão executados; os testes autenticados serão pulados." >&2
    HAS_API_KEY=0
else
    HAS_API_KEY=1
fi

if ! [[ "$TIMEOUT" =~ ^[0-9]+$ ]] || (( TIMEOUT < 1 )); then
    echo "ERRO: KNIGHTBOT_TIMEOUT deve ser um número inteiro positivo." >&2
    exit 2
fi

print_header() {
    echo
    echo "============================================================"
    echo "KnightBot API smoke test"
    echo "Base URL: $BASE_URL"
    echo "Query:    $TEST_QUERY"
    echo "YouTube:  $TEST_YOUTUBE_URL"
    echo "Timeout:  ${TIMEOUT}s"
    echo "============================================================"
}

urlencode() {
    python3 - "$1" <<'PY'
import sys
from urllib.parse import quote
print(quote(sys.argv[1], safe=""))
PY
}

shorten() {
    local value="$1"
    if (( ${#value} > 220 )); then
        printf '%s...\n' "${value:0:220}"
    else
        printf '%s\n' "$value"
    fi
}

body_preview() {
    local file="$1"
    local content
    content="$(tr '\n\r\t' '   ' < "$file" 2>/dev/null || true)"
    shorten "$content"
}

json_check() {
    # Retorna 0 somente quando a resposta é JSON com success=true e result.download.
    local body_file="$1"
    python3 - "$body_file" <<'PY'
import json
import sys

try:
    with open(sys.argv[1], "rb") as fh:
        data = json.load(fh)
except Exception:
    raise SystemExit(1)

result = data.get("result") if isinstance(data, dict) else None
download = result.get("download") if isinstance(result, dict) else None

if data.get("success") is not True or not isinstance(result, dict) or not isinstance(download, str) or not download.strip():
    raise SystemExit(1)

print(json.dumps({
    "success": data.get("success"),
    "has_download": True,
    "has_title": bool(result.get("title")),
    "has_thumbnail": bool(result.get("thumbnail")),
    "has_duration": bool(result.get("duration")),
    "has_url": bool(result.get("url")),
}, ensure_ascii=False))
PY
}

json_shape_check() {
    # Valida apenas JSON sintaticamente válido; útil para endpoints sem contrato de download.
    local body_file="$1"
    python3 - "$body_file" <<'PY'
import json
import sys

try:
    with open(sys.argv[1], "rb") as fh:
        json.load(fh)
except Exception:
    raise SystemExit(1)
PY
}

record_result() {
    local outcome="$1"
    local label="$2"
    local detail="${3:-}"

    TOTAL_COUNT=$((TOTAL_COUNT + 1))
    case "$outcome" in
        PASS)
            PASS_COUNT=$((PASS_COUNT + 1))
            printf '[PASS] %-30s %s\n' "$label" "$detail"
            ;;
        FAIL)
            FAIL_COUNT=$((FAIL_COUNT + 1))
            printf '[FAIL] %-30s %s\n' "$label" "$detail"
            ;;
        WARN)
            WARN_COUNT=$((WARN_COUNT + 1))
            printf '[WARN] %-30s %s\n' "$label" "$detail"
            ;;
        *)
            echo "ERRO INTERNO: resultado desconhecido: $outcome" >&2
            ;;
    esac
}

run_request() {
    # Argumentos:
    #   1 label
    #   2 método/URL completo
    #   3 modo de autenticação: header | none | invalid
    #   4 expectativa: page | api-json | api-json-any | missing-key | invalid-key
    local label="$1"
    local request_url="$2"
    local auth_mode="$3"
    local expectation="$4"
    local safe_label
    safe_label="$(printf '%s' "$label" | tr ' /:?&=' '_')"
    local body_file="$TMP_DIR/${safe_label}.body"
    local header_file="$TMP_DIR/${safe_label}.headers"
    local meta_file="$TMP_DIR/${safe_label}.meta"
    local curl_exit
    local http_code
    local content_type
    local time_total
    local curl_args=(
        --silent
        --show-error
        --location
        --http1.1
        --max-time "$TIMEOUT"
        --dump-header "$header_file"
        --output "$body_file"
        --write-out '%{http_code}\t%{content_type}\t%{time_total}'
    )

    case "$auth_mode" in
        header)
            curl_args+=(--header "X-API-Key: $KNIGHTBOT_API_KEY")
            ;;
        invalid)
            curl_args+=(--header 'X-API-Key: invalid-smoke-test-key')
            ;;
        none)
            ;;
        *)
            record_result FAIL "$label" "modo de autenticação inválido"
            return
            ;;
    esac

    if (( VERBOSE == 1 )); then
        echo
        echo "--- $label ---"
        # A URL nunca contém a chave neste script, mas ainda assim imprimimos apenas a rota.
        echo "GET ${request_url#"$BASE_URL"}"
    fi

    set +e
    curl "${curl_args[@]}" "$request_url" >"$meta_file"
    curl_exit=$?
    set -e

    if (( curl_exit != 0 )); then
        record_result FAIL "$label" "curl exit $curl_exit (rede, DNS, TLS ou timeout)"
        return
    fi

    # curl --write-out não precisa terminar a saída com newline; nesse caso,
    # read pode retornar 1 mesmo tendo preenchido as variáveis corretamente.
    IFS=$'\t' read -r http_code content_type time_total < "$meta_file" || true
    content_type="${content_type:-unknown}"
    http_code="${http_code:-000}"
    time_total="${time_total:-unknown}"

    local detail="HTTP $http_code; ${content_type}; ${time_total}s"
    local preview
    preview="$(body_preview "$body_file")"

    case "$expectation" in
        page)
            if [[ "$http_code" == "200" ]]; then
                record_result PASS "$label" "$detail"
            else
                record_result FAIL "$label" "$detail; corpo: $(shorten "$preview")"
            fi
            ;;
        api-json)
            if [[ "$http_code" == "200" ]] && json_check "$body_file" >/dev/null 2>&1; then
                local fields
                fields="$(json_check "$body_file")"
                record_result PASS "$label" "$detail; $fields"
            elif [[ "$http_code" == "200" ]] && json_shape_check "$body_file" >/dev/null 2>&1; then
                record_result FAIL "$label" "$detail; JSON válido, mas sem success=true/result.download; corpo: $(shorten "$preview")"
            else
                record_result FAIL "$label" "$detail; corpo: $(shorten "$preview")"
            fi
            ;;
        api-json-any)
            if [[ "$http_code" == "200" ]] && json_shape_check "$body_file" >/dev/null 2>&1; then
                record_result PASS "$label" "$detail}; JSON válido"
            elif [[ "$http_code" == "200" ]]; then
                record_result FAIL "$label" "$detail; resposta não é JSON: $(shorten "$preview")"
            else
                record_result FAIL "$label" "$detail; corpo: $(shorten "$preview")"
            fi
            ;;
        missing-key)
            if [[ "$http_code" == "401" ]]; then
                record_result PASS "$label" "$detail; autenticação ausente rejeitada corretamente"
            elif [[ "$http_code" == "403" ]]; then
                record_result WARN "$label" "$detail; API rejeitou, mas retornou 403 em vez de 401"
            else
                record_result FAIL "$label" "$detail; esperado 401; corpo: $(shorten "$preview")"
            fi
            ;;
        invalid-key)
            if [[ "$http_code" == "401" || "$http_code" == "403" ]]; then
                record_result PASS "$label" "$detail; chave inválida rejeitada"
            else
                record_result FAIL "$label" "$detail; esperado 401/403; corpo: $(shorten "$preview")"
            fi
            ;;
        *)
            record_result FAIL "$label" "expectativa inválida"
            ;;
    esac

    if (( VERBOSE == 1 )); then
        echo "Corpo: $preview"
    fi
}

print_header

echo
echo "[1/3] Disponibilidade básica"
run_request "homepage" "$BASE_URL/" none page
run_request "documentation" "$BASE_URL/docs" none page

echo
echo "[2/3] Autenticação"
run_request "missing-key" "$BASE_URL/api/download/ytaudio?$(printf 'query=%s' "$(urlencode "$TEST_QUERY")")" none missing-key
run_request "invalid-key" "$BASE_URL/api/download/ytaudio?$(printf 'query=%s' "$(urlencode "$TEST_QUERY")")" invalid invalid-key

if (( HAS_API_KEY == 1 )); then
    echo
echo "[3/3] Contrato dos endpoints autenticados"

    # A chave é enviada somente no cabeçalho. Os parâmetros abaixo não contêm segredo.
    run_request \
        "ytaudio-query" \
        "$BASE_URL/api/download/ytaudio?query=$(urlencode "$TEST_QUERY")&format=128kbps" \
        header \
        api-json

    run_request \
        "ytaudio-url" \
        "$BASE_URL/api/download/ytaudio?url=$(urlencode "$TEST_YOUTUBE_URL")&format=128kbps" \
        header \
        api-json

    run_request \
        "ytmp4-url" \
        "$BASE_URL/api/download/ytmp4?url=$(urlencode "$TEST_YOUTUBE_URL")" \
        header \
        api-json

    run_request \
        "universal-mp3" \
        "$BASE_URL/api/download?type=mp3&url=$(urlencode "$TEST_YOUTUBE_URL")" \
        header \
        api-json
else
    echo
    echo "[3/3] Contrato dos endpoints autenticados: pulado por falta de KNIGHTBOT_API_KEY"
fi

echo
echo "Resumo: $PASS_COUNT PASS | $WARN_COUNT WARN | $FAIL_COUNT FAIL | $TOTAL_COUNT testes"
echo "Arquivos temporários removidos ao sair."

if (( FAIL_COUNT > 0 )); then
    exit 1
fi

exit 0
