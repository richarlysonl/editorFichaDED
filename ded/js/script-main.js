// Variável global para armazenar os resultados das rolagens
let atributos = {};
let valoresDisponiveis = [];

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


function limparCampos() {
    const campos = ["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma"];
    campos.forEach(id => {
        document.getElementById(id).textContent = "";
    });
}

function allowDrop(event) {
    event.preventDefault();
}

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
}

async function preencherFichaDnD() {
    const nome = document.getElementById('nome').value;
    const nivel = document.getElementById('nivel').value;
    const raca = document.getElementById('raca').value;
    const classe = document.getElementById('classe').value;
    const forca = document.getElementById('forca').value;
    const destreza = document.getElementById('destreza').value;
    const constituicao = document.getElementById('constituicao').value;
    const inteligencia = document.getElementById('inteligencia').value;
    const sabedoria = document.getElementById('sabedoria').value;
    const carisma = document.getElementById('carisma').value;
    const bonus = definirClasse(classe);
    const mod = definirRaca(raca);
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
        if (atributos !== undefined) {
            form.getTextField("STR").setText(String(forca || 0));
            form.getTextField("DEX").setText(String(destreza || 0));
            form.getTextField("CON").setText(String(constituicao || 0));
            form.getTextField("INT").setText(String(inteligencia || 0));
            form.getTextField("WIS").setText(String(sabedoria || 0));
            form.getTextField("CHA").setText(String(carisma || 0));
        } else {
            form.getTextField("STR").setText(String((atributos.forca + (bonus.forca || 0) + (mod.forca || 0))));
            form.getTextField("DEX").setText(String((atributos.destreza + (bonus.destreza || 0) + (mod.destreza || 0))));
            form.getTextField("CON").setText(String((atributos.constituicao + (bonus.constituicao || 0) + (mod.constituicao || 0))));
            form.getTextField("INT").setText(String(atributos.inteligencia + (bonus.inteligencia || 0) + (mod.inteligencia || 0)));
            form.getTextField("WIS").setText(String(atributos.sabedoria + (bonus.sabedoria || 0) + (mod.sabedoria || 0)));
            form.getTextField("CHA").setText(String(atributos.carisma + (bonus.carisma || 0) + (mod.carisma || 0)));
        } 
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