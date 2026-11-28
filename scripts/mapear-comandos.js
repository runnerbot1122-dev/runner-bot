const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const commandsDir = path.join(root, "src", "commands");
const menusDir = path.join(root, "src", "utils", "menus");
const outputDir = path.join(root, "docs");
const loader = require(path.join(root, "src", "core", "loader"));

function listNames(command) {
    const names = Array.isArray(command?.name) ? command.name : [command?.name];
    return [...new Set(names.filter(Boolean).map(String).map(name => name.trim().toLowerCase()).filter(Boolean))];
}

const entries = [];
const aliasOwners = new Map();
const loadErrors = [];

for (const category of fs.readdirSync(commandsDir).sort()) {
    const directory = path.join(commandsDir, category);
    if (!fs.statSync(directory).isDirectory()) continue;
    for (const file of fs.readdirSync(directory).filter(name => name.endsWith(".js")).sort()) {
        const filePath = path.join(directory, file);
        let command;
        try {
            command = require(filePath);
        } catch (error) {
            loadErrors.push({ category, file, error: error.message });
            continue;
        }
        const aliases = listNames(command);
        const entry = {
            category,
            file: `src/commands/${category}/${file}`,
            name: aliases[0] || null,
            aliases,
            description: command?.description || "",
            loadedAliases: aliases.filter(alias => loader.get(alias) === command)
        };
        entries.push(entry);
        for (const alias of aliases) {
            if (!aliasOwners.has(alias)) aliasOwners.set(alias, []);
            aliasOwners.get(alias).push(entry.file);
        }
    }
}

const menus = [];
for (const file of fs.readdirSync(menusDir).filter(name => name.endsWith(".js")).sort()) {
    const filePath = path.join(menusDir, file);
    let rendered = "";
    try {
        rendered = String(require(filePath)("X"));
    } catch (error) {
        rendered = `[erro: ${error.message}]`;
    }
    const commands = [...new Set([...rendered.matchAll(/X([a-zA-Z][a-zA-Z0-9_]*)/g)]
        .map(match => match[1].toLowerCase())
        .filter(alias => loader.get(alias)))];
    menus.push({ file: `src/utils/menus/${file}`, commands });
}

const allAliases = [...aliasOwners.keys()].sort();
const effectiveAliases = allAliases.filter(alias => loader.get(alias));
const duplicateAliases = [...aliasOwners.entries()]
    .filter(([, owners]) => owners.length > 1)
    .map(([alias, owners]) => ({ alias, owners }));
const menuReferenced = new Set(menus.flatMap(menu => menu.commands));
const aliasesNotInMenus = effectiveAliases.filter(alias => !menuReferenced.has(alias));
const menuMissing = [...new Set(menus.flatMap(menu => menu.commands))].filter(alias => !loader.get(alias));
const categoryStats = {};
for (const entry of entries) categoryStats[entry.category] = (categoryStats[entry.category] || 0) + 1;

const report = {
    generatedAt: new Date().toISOString(),
    summary: {
        commandFiles: entries.length,
        declaredAliases: allAliases.length,
        effectiveAliases: effectiveAliases.length,
        menuFiles: menus.length,
        loadErrors: loadErrors.length,
        duplicateAliases: duplicateAliases.length
    },
    categoryStats,
    commands: entries,
    menus,
    duplicateAliases,
    aliasesNotInMenus,
    menuMissing,
    loadErrors
};

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, "mapeamento-comandos-aliases.json"), `${JSON.stringify(report, null, 2)}\n`);

const markdown = [];
markdown.push("# Mapeamento completo de comandos e aliases", "");
markdown.push(`Gerado em ${report.generatedAt}. Inventário somente leitura baseado em src/commands, no loader e nos menus atuais.`, "");
markdown.push("## Resumo", "");
markdown.push(`- Arquivos de comando: **${entries.length}**`);
markdown.push(`- Aliases declarados, sem repetição: **${allAliases.length}**`);
markdown.push(`- Aliases efetivamente carregados: **${effectiveAliases.length}**`);
markdown.push(`- Arquivos de menu: **${menus.length}**`);
markdown.push(`- Conflitos de alias: **${duplicateAliases.length}**`);
markdown.push(`- Erros de carregamento: **${loadErrors.length}**`, "");
markdown.push("## Comandos por categoria e arquivo", "");

for (const category of Object.keys(categoryStats).sort()) {
    markdown.push(`### ${category} (${categoryStats[category]} arquivos)`, "");
    markdown.push("| Arquivo | Alias principal | Aliases | Descrição |", "|---|---|---|---|");
    for (const entry of entries.filter(item => item.category === category).sort((a, b) => a.file.localeCompare(b.file))) {
        const aliases = entry.aliases.map(alias => `\`${alias}\``).join(", ");
        const description = String(entry.description).replaceAll("|", "\\|").replaceAll("\n", " ");
        markdown.push(`| \`${entry.file}\` | \`${entry.name || ""}\` | ${aliases} | ${description} |`);
    }
    markdown.push("");
}

markdown.push("## Menus", "");
for (const menu of menus) {
    markdown.push(`### \`${menu.file}\``, "");
    markdown.push(menu.commands.length ? menu.commands.map(alias => `- \`${alias}\``).join("\n") : "- Nenhum comando detectado", "");
}

markdown.push("## Aliases carregados que não aparecem nos menus", "");
markdown.push(aliasesNotInMenus.length ? aliasesNotInMenus.map(alias => `- \`${alias}\``).join("\n") : "- Nenhum", "");
markdown.push("## Conflitos e erros", "");
if (duplicateAliases.length) {
    for (const conflict of duplicateAliases) markdown.push(`- \`${conflict.alias}\`: ${conflict.owners.map(owner => `\`${owner}\``).join(" e ")}`);
} else {
    markdown.push("- Nenhum conflito encontrado.");
}
for (const error of loadErrors) markdown.push(`- Erro ao carregar \`${error.category}/${error.file}\`: ${error.error}`);
markdown.push("", "## Observações", "", "- Aliases são normalizados para minúsculas pelo loader.", "- Arquivos de aliases compatíveis continuam listados individualmente para preservar comandos históricos.", "- Aliases fora dos menus não são necessariamente um problema: podem ser aliases alternativos, administrativos ou comandos acessíveis diretamente.", "");
fs.writeFileSync(path.join(outputDir, "mapeamento-comandos-aliases.md"), `${markdown.join("\n")}\n`);

console.log(JSON.stringify(report.summary, null, 2));
console.log("Relatórios gerados em docs/mapeamento-comandos-aliases.md e docs/mapeamento-comandos-aliases.json");
