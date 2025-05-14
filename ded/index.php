<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <form id="meuFormulario">
    <label for="nome">Nome:</label>
    <input type="text" id="nome" name="nome" required>
    <button type="submit">Salvar como JSON</button>
  </form>

  <script>
    document.getElementById('meuFormulario').addEventListener('submit', function(event) {
      event.preventDefault(); // Evita envio tradicional do formulário

      const nome = document.getElementById('nome').value;

      const dados = {
        nome: nome
      };

      const jsonStr = JSON.stringify(dados, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "formulario.json";
      a.click();

      URL.revokeObjectURL(url);
    });
  </script>
</body>
</html>
