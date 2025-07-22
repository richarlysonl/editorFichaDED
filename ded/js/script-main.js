// Variável global para armazenar os resultados das rolagens
let atributos = {};
let valoresDisponiveis = [];
let skills = {
    forca: 0,
    destreza: 0,
    constituicao: 0,
    inteligencia: 0,
    sabedoria: 0,
    carisma: 0
};
let modificadores = {
    forca: 0,
    destreza: 0,
    constituicao: 0,
    inteligencia: 0,
    sabedoria: 0,
    carisma: 0
};
let proficiencia = 2; // Valor padrão de proficiência, pode ser alterado conforme necessário
/*parte de rolagem de dados e definição dos atributos*/
function rolarDados(valor_max, valor_min, num_dados, num_descartes, qntd) {
    valoresDisponiveis = []; // Limpa os valores anteriores
    for (let i = 0; i < qntd; i++) {
        const rolagem = [];
        for (let j = 0; j < num_dados; j++) {
            const valor = Math.floor(Math.random() * valor_max) + valor_min;
            rolagem.push(valor);
        }
        rolagem.sort((a, b) => b - a);
        const usados = rolagem.slice(0, num_dados - num_descartes);
        const soma = usados.reduce((a, b) => a + b, 0);
        valoresDisponiveis.push(soma); // Adiciona a soma ao array global
    }
    const botao = document.getElementById("botaoRolar");
    if (botao) {
        botao.remove();
    }
    renderRolagens(); // Atualiza a interface com os novos valores
}

// Função para renderizar os valores disponíveis na área de rolagens
function renderRolagens() {
    const container = document.getElementById("rolagens");
    container.innerHTML = "";

    valoresDisponiveis.forEach((valor, index) => {
        const span = document.createElement("span");
        span.textContent = valor;
        span.className = "valor-dado";
        span.draggable = true;
        span.id = "dado" + index;
        span.addEventListener("dragstart", (event) => {
            event.dataTransfer.setData("text", valor);
        });
        container.appendChild(span);
    });

    // Permitir que os campos de atributos também possam ser arrastados
    Object.keys(atributos).forEach((atributo) => {
        const div = document.getElementById(atributo);
        const valor = atributos[atributo];
        if (valor !== undefined && valor !== "") {
            div.draggable = true;
            div.addEventListener("dragstart", (event) => {
                event.dataTransfer.setData("text", valor);
                event.dataTransfer.setData("source", atributo); // indica de qual campo veio
            });
        }
    });
}

// Função para limpar os campos de atributos
// Limpa os valores dos campos de atributos e remove o botão de finalizar
function limparCampos() {
    const campos = ["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma"];
    campos.forEach(id => {
        document.getElementById(id).textContent = "";
    });
}

function allowDrop(event) {
    event.preventDefault();
}
// Função para lidar com o drop dos valores nos campos de atributos
// Verifica se o valor é um número e se o campo de destino é válido
function drop(event, atributo) {
    event.preventDefault();
    const valor = parseInt(event.dataTransfer.getData("text"));
    const origem = event.dataTransfer.getData("source");

    // Se for uma troca entre campos de atributos
    if (origem && origem !== atributo) {
        const valorDestino = atributos[atributo];
        atributos[atributo] = valor;
        atributos[origem] = valorDestino;

        document.getElementById(atributo).textContent = valor;
        document.getElementById(origem).textContent = valorDestino;

    } else {
        // Valor veio da área de rolagens
        if (atributos[atributo] !== undefined) {
            valoresDisponiveis.push(parseInt(atributos[atributo]));
        }

        atributos[atributo] = valor;
        const index = valoresDisponiveis.indexOf(valor);
        if (index !== -1) {
            valoresDisponiveis.splice(index, 1);
        }
        document.getElementById(atributo).textContent = valor;
    }

    renderRolagens(); // Atualiza a interface
    verificarAtributosPreenchidos(); // ✅ adiciona verificação ao final
}
// Função para verificar se todos os atributos estão preenchidos
// Se todos os campos de atributos estiverem preenchidos, cria um botão para finalizar
function verificarAtributosPreenchidos() {
    const campos = ["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma"];
    const todosPreenchidos = campos.every(id => {
        const el = document.getElementById(id);
        if (!el) return false;
        const valor = el.textContent || el.value;
        return valor && !isNaN(valor);
    });

    // Se todos preenchidos, cria o botão se ainda não existir
    if (todosPreenchidos && !document.getElementById("botaoFinalizar")) {
        const btn = document.createElement("button");
        btn.id = "botaoFinalizar";
        btn.textContent = "Finalizar Atributos e adicionar Bônus da classe e raça";
        btn.onclick = aplicarValoresFinal; // chama sua função que transforma + trava
        document.getElementById("atributos").appendChild(btn);
    }
}

/*travar e transformar os inputs*/
// Função para travar os atributos, tornando-os apenas leitura
// Isso impede que os usuários editem os valores, mas ainda os vejam
function travarAtributos() {
    const campos = ["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma"];
    campos.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.readOnly = true; // impede edição, mas ainda é visível
            // ou: input.disabled = true; // se quiser bloquear totalmente
        }
    });
}
// Função para transformar os atributos em inputs com os valores finais
// Transforma os valores dos atributos em inputs, somando os bônus da classe e raça
function transformarAtributosEmInputs() {
    const atributosLista = ["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma"];
    const raca = document.getElementById('raca').value || {};
    const classe = document.getElementById('classe').value || {};
    if (raca === "" || classe === "") {
        alert("Por favor, preencha a classe e a raça antes de finalizar os atributos.");
        return;
    }
    atributosLista.forEach(id => {
        const valor = atributos[id]; // valor armazenado
        const container = document.getElementById(id);
        const bonus = definirClasse(classe);
        const mod = definirRaca(raca);
        console.log("bonus: " + bonus[id] + " mod: " + mod[id])
        // Evita recriar se já for um input
        if (container && container.tagName !== "INPUT") {
            const input = document.createElement("input");
            input.type = "number";
            input.value = parseInt(valor + (bonus[id] || 0) + (mod[id] || 0)) || 0; // soma os bônus
            input.id = id;
            input.className = "atributo-input";
            container.replaceWith(input); // substitui o <div> pelo <input>
        }
    });
    document.getElementById("botaoFinalizar").remove();
}
// Função para aplicar os valores finais e travar os atributos
// Chama as funções para transformar os atributos em inputs e travar os inputs
function aplicarValoresFinal() {
    transformarAtributosEmInputs(); // transforma os valores em inputs
    travarAtributos(); // trava os inputs para não serem editados
}
// Função para atualizar os bônus dos atributos com base na classe e raça selecionadas
function atualizarBonus() {
    const classeSelecionada = document.getElementById("classe").value;
    const racaSelecionada = document.getElementById("raca").value;
    const bonusClasse = definirClasse(classeSelecionada) || {};
    const bonusRaca = definirRaca(racaSelecionada) || {};

    // Lista de atributos
    const atributo = ["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma"];

    atributo.forEach(attr => {
        const input = document.getElementById(attr);
        // pega o valor atual do input
        if (input && input.tagName === "INPUT") {
            const valorClasse = bonusClasse[attr] || 0;
            const valorRaca = bonusRaca[attr] || 0;
            console.log("valor do atributo " + attr + ": " + atributos[attr]);
            input.value = atributos[attr] + valorClasse + valorRaca;
            console.log("Atualizando " + attr + ": " + input.value);
        }
    });
}

/*skills*/
// Função para adicionar campos de skills dinamicamente
function adicionarSkills(event) {
    event.preventDefault();
    const numSkills = document.getElementById("numSkills").value;
    if (numSkills < 0 || numSkills > 18) {
        alert("Número de skills inválido. Deve ser entre 0 e 18.");
        return;
    }
    const skillsContainer = document.getElementById("skillsContainer");
    skillsContainer.innerHTML = ""; // Limpa o container antes de adicionar novas skills
    for (let i = 0; i < numSkills; i++) {
        const skillOption = document.createElement("select");
        skillOption.id = `skill[${i}]`;
        skillOption.options.add(new Option("Acrobacia", "acrobacia"));// Adiciona opções de skills
        skillOption.options.add(new Option("Arcanismo", "arcanismo"));
        skillOption.options.add(new Option("Atletismo", "atletismo"));
        skillOption.options.add(new Option("Enganação", "enganacao"));
        skillOption.options.add(new Option("Furtividade", "furtividade"));
        skillOption.options.add(new Option("História", "historia"));
        skillOption.options.add(new Option("Intimidação", "intimidacao"));
        skillOption.options.add(new Option("Intuição", "intuicao"));
        skillOption.options.add(new Option("Investigação", "investigacao"));
        skillOption.options.add(new Option("Liderança", "lideranca"));
        skillOption.options.add(new Option("Medicina", "medicina"));
        skillOption.options.add(new Option("Natureza", "natureza"));
        skillOption.options.add(new Option("Percepção", "percepcao"));
        skillOption.options.add(new Option("Persuasão", "persuasao"));
        skillOption.options.add(new Option("Religião", "religiao"));
        skillOption.options.add(new Option("Sobrevivência", "sobrevivencia"));
        skillOption.placeholder = `Skill ${i + 1}`;
        skillOption.onchange = skills(); // Chama a função skills ao mudar a skill selecionada
        skillOption.className = "skill-input";
        skillsContainer.appendChild(skillOption);
    }
}
function Skills() {
    const skillsContainer = document.getElementById("skillsContainer");
    const skillOptions = skillsContainer.querySelectorAll("select");
    const attr = {
        acrobacia: "destreza",
        arcanismo: "inteligencia",
        atletismo: "forca",
        enganacao: "carisma",
        furtividade: "destreza",
        historia: "inteligencia",
        intimacao: "carisma",
        intuicao: "sabedoria",
        investigacao: "inteligencia",
        lideranca: "carisma",
        medicina: "sabedoria",
        natureza: "inteligencia",
        percepcao: "sabedoria",
        persuasao: "carisma",
        religiao: "inteligencia",
        sobrevivencia: "sabedoria"
    }

    skillOptions.forEach(skill => {
        if (skill.value) {
            const skillName = skill.value;
            const atributo = attr[skillName];
            if (atributo) {
                skills[atributo] += parseInt(proficiencia) || 0; // Adiciona o valor da proficiência ao atributo correspondente

            } else {
                console.warn(`Atributo não encontrado para a skill: ${skillName}`);
            }
        }
    });
}

function Proficiencia() {
    const nivel = document.getElementById("nivel").value;
    if (nivel > 0 && nivel <= 4) {
        proficiencia = 2;
    }
    else if (nivel > 4 && nivel <= 8) {
        proficiencia = 3;
    } else if (nivel > 8 && nivel <= 12) {
        proficiencia = 4;
    } else if (nivel > 12 && nivel <= 16) {
        proficiencia = 5;
    } else if (nivel > 16 && nivel <= 20) {
        proficiencia = 6;
    } else {
        alert("Nível inválido. Deve ser entre 1 e 20.");
        return;
    }
}
// Função para ler uma ficha D&D preenchida e preencher os campos
// Carrega um PDF, lê os campos e preenche os inputs correspondentes
async function PreencherFichaDnD() {
    const nome = document.getElementById('nome').value;
    const nivel = document.getElementById('nivel').value;
    const raca = document.getElementById('raca').value;
    const classe = document.getElementById('classe').value;
    const bonus = definirClasse(classe);
    const mod = definirRaca(raca);
    const camposAtributos = { STR: "forca", DEX: "destreza", CON: "constituicao", INT: "inteligencia", WIS: "sabedoria", CHA: "carisma" };
    const url = "5E_CharacterSheet_Fillable.pdf";
    try {
        const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());
        const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
        const form = pdfDoc.getForm();
        form.getTextField("CharacterName").setText(nome);
        form.getTextField("ClassLevel").setText(`${classe} ${nivel}`);
        form.getTextField("PlayerName").setText("João Aventureiro");
        form.getTextField("Race ").setText(raca);
        form.getTextField("Alignment").setText("Caótico Bom");
        form.getTextField("Background").setText("baitola");
            Object.entries(camposAtributos).forEach(([campoPdf, idAtributo]) => {
                const valor = document.getElementById(idAtributo).value || 0;
                form.getTextField(campoPdf).setText(String(valor));
                console.log("Atributo " + campoPdf + ": " + valor);
                let modificador = Math.floor((valor - 10) / 2);
                if (campoPdf === "DEX")
                form.getTextField(campoPdf+"mod ").setText(String(modificador)> 0 ? "+" + modificador : modificador);
                else if (campoPdf === "CHA")
                form.getTextField("CHamod").setText(String((modificador)> 0 ? "+" + modificador : modificador));
                else
                form.getTextField(campoPdf+"mod").setText(String(modificador)> 0 ? "+" + modificador : modificador);
            });
        Proficiencia(); // Atualiza o valor de proficiência
        form.getTextField("ProfBonus").setText(String(proficiencia || 0));
        const pdfBytes = await pdfDoc.save();

        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "ficha_preenchida.pdf";
        link.click();
        URL.revokeObjectURL(link.href);
    } catch (e) {
        alert("Erro ao carregar ou preencher o PDF.");
        console.error(e);
    }
}
function definirClasse(classe) {
    let bonus = {};
    switch (classe) {
        case "guerreiro":
            bonus.forca = 1;
            bonus.destreza = 1;
            bonus.constituicao = 1;
            bonus.inteligencia = 1;
            bonus.sabedoria = 1;
            bonus.carisma = 1;
            return bonus;
        case "mago":
            bonus.forca = 0;
            bonus.destreza = 1;
            bonus.constituicao = 1;
            bonus.inteligencia = 3;
            bonus.sabedoria = 1;
            bonus.carisma = 1;
            return bonus;
        case "ladino":
            bonus.forca = 1;
            bonus.destreza = 1;
            bonus.constituicao = 1;
            bonus.inteligencia = 1;
            bonus.sabedoria = 1;
            bonus.carisma = 1;
            return bonus;
        default:
            alert("Classe não definida.");
    }
}

function definirRaca(raca) {
    let mod = {};
    switch (raca) {
        case "humano":
            mod.forca = 1;
            mod.destreza = 1;
            mod.constituicao = 1;
            mod.inteligencia = 1;
            mod.sabedoria = 1;
            mod.carisma = 1;
            return mod;
        case "orc":
            mod.forca = 3;
            mod.destreza = 2;
            mod.constituicao = 1;
            mod.inteligencia = -1;
            mod.sabedoria = 1;
            mod.carisma = 1;
            return mod;
        case "ladino":
            bonus.forca = 1;
            bonus.destreza = 1;
            bonus.constituicao = 1;
            bonus.inteligencia = 1;
            bonus.sabedoria = 1;
            bonus.carisma = 1;
            return mod;
        default:
            alert("raça não definida.");
    }
}
function mostrarBotaoBonus() {
    const classe = document.getElementById("classe").value;
    const botao = document.getElementById("botao-container");
    botao.style.display = classe !== "" ? "block" : "none";
}
function mostrarBonus() {
    const classe = document.getElementById("classe").value;
    const bonus = definirClasse(classe);
    const mostrarBonus = document.getElementById("mostrarBonus");
    const botaoMostrarBonus = document.getElementById("botaoMostrarBonus");
    // Alterna o texto do botão
    if (botaoMostrarBonus.textContent == "Ver Bônus da Classe") {
        botaoMostrarBonus.textContent = "Esconder Bônus da Classe";
    } else {
        botaoMostrarBonus.textContent = "Ver Bônus da Classe";
    }
    if (mostrarBonus.textContent.trim() !== "") {
        // já está mostrando, então limpa
        mostrarBonus.textContent = "";
        return;
    }
    if (bonus) {
        mostrarBonus.innerHTML = `
          <strong>Bônus da Classe:</strong><br>
          Força: ${bonus.forca || 0}<br>
          Destreza: ${bonus.destreza || 0}<br>
          Constituição: ${bonus.constituicao || 0}<br>
          Inteligência: ${bonus.inteligencia || 0}<br>
          Sabedoria: ${bonus.sabedoria || 0}<br>
          Carisma: ${bonus.carisma || 0}
        `;
    } else {
        mostrarBonus.innerHTML = "Nenhum bônus definido para esta classe.";
    }

}

function mostrarBotaoMod() {
    const raca = document.getElementById("raca").value;
    const botao = document.getElementById("botao-raca-container");
    botao.style.display = raca !== "" ? "block" : "none";
}

function mostrarMod() {
    const raca = document.getElementById("raca").value;
    const mod = definirRaca(raca);
    const mostrarMod = document.getElementById("mostrarMod");
    const botaoMostrarMod = document.getElementById("botaoMostrarMod");
    // Alterna o texto do botão
    if (botaoMostrarMod.textContent == "Ver Bônus da raça") {
        botaoMostrarMod.textContent = "Esconder Bônus da raça";
    } else {
        botaoMostrarMod.textContent = "Ver Bônus da raça";
    }
    if (mostrarMod.textContent.trim() !== "") {
        // já está mostrando, então limpa
        mostrarMod.textContent = "";
        return;
    }
    if (mod) {
        // Exibe os bônus da raça
        mostrarMod.innerHTML = `
          <strong>Bônus da Classe:</strong><br>
          Força: ${mod.forca || 0}<br>
          Destreza: ${mod.destreza || 0}<br>
          Constituição: ${mod.constituicao || 0}<br>
          Inteligência: ${mod.inteligencia || 0}<br>
          Sabedoria: ${mod.sabedoria || 0}<br>
          Carisma: ${mod.carisma || 0}
        `;
    } else {
        mostrarMod.innerHTML = "Nenhum bônus definido para esta classe.";
    }

}