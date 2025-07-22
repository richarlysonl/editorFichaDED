      async function lerFichaDnD() {
  try {
    const url = "ficha_preenchida.pdf"; // Caminho do PDF preenchido
    const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());
    const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    // Mapeamento: nome do campo no PDF => ID do campo HTML
    const camposMapeados = {
      "CharacterName": "nome",
      "STR": "forca",
      "DEX": "destreza",
      "CON": "constituicao",
      "INT": "inteligencia",
      "WIS": "sabedoria",
      "CHA": "carisma",
      "ClassLevel": "classe_nivel", // será separado depois
      "Race ": "raca",
    };

    for (const campoPdf in camposMapeados) {
      const valor = form.getTextField(campoPdf).getText();

      if (campoPdf === "ClassLevel") {
        const [classe, nivel] = valor.trim().split(" ");
        document.getElementById("classe").value = classe || "";
        document.getElementById("nivel").value = nivel || "";
      } else {
        const idHtml = camposMapeados[campoPdf];
        const input = document.getElementById(idHtml);
        if (input) {
          input.value = valor;
        }
      }
    }

  } catch (e) {
    alert("Erro ao carregar ou ler o PDF.");
    console.error(e);
  }
}

      // Você pode chamar isso no onload da nova página:
