# pip install pyautogui
import pyautogui
import time
import json
# pyautogui.press() aperta uma tecla
# pyautogui.write digita algo
# pyautogui.click clica em uma posição

with open('dados.json', 'r', encoding='utf-8') as arquivo: # Abre o arquivo JSON
    # 'r' -> read (ler)
    dados = json.load(arquivo) # Carrega os dados do arquivo JSON
nome = dados['nome']
nivel = dados['nivel']
pyautogui.PAUSE = 2
pyautogui.press("win")
pyautogui.write("5E_CharacterSheet_Fillable.pdf")
pyautogui.click(x=551, y=132)
pyautogui.press("enter")
# passo 2: fazer login
# preencher email
pyautogui.click(x=599, y=255)
pyautogui.write(nome)
pyautogui.click(x=824, y=236)
pyautogui.write(nivel)
# preencher senha
#pyautogui.press("tab")
#pyautogui.write("minhasenhasupersecreta")
# logar
#pyautogui.press("tab")
#pyautogui.press("enter")
# botao logar


# esperar 3 segundos
# passo 3 importar a base de dados
#import pandas
#tabela = pandas.read_csv("produtos.csv")
#print(tabela)
# passo 4 cadastrar 1 produto
#for coluna in tabela.columns
#for linha in tabela.index: # para cada linha na minha tabela
 #   pyautogui.click(x=613,y=328)
  #  codigo=tabela.loc[linha,"codigo"]
  #  pyautogui.write(codigo)

  #  pyautogui.press("tab")# passar para o proximo campo
  #  marca=tabela.loc[linha,"marca"]
  #  pyautogui.write(marca)

   # pyautogui.press("tab")# passar para o proximo campo
   # tipo=tabela.loc[linha,"tipo"]
   # pyautogui.write(tipo)
   # pyautogui.press("tab")# passar para o proximo campo
   # categoria=str(tabela.loc[linha,"categoria"])                          # string = texto -> srt()
   # pyautogui.write(categoria)
   # pyautogui.press("tab")# passar para o proximo campo
   # preco_unitario=tabela.loc[linha,"preco_unitario"]
   # pyautogui.write(preco_unitario)
   # pyautogui.press("tab")# passar para o proximo campo
   # custo=tabela.loc[linha,"custo"]
   # pyautogui.write(custo)
   # pyautogui.press("tab")# passar para o proximo campo
   # obs=tabela.loc[linha,"obs"]
   # if obs != "nan":
   #     pyautogui.write(obs)
   # pyautogui.press("tab")# passou para o botao enviar 
   # pyautogui.press("enter")
   # pyautogui.scroll(10000)
#passo 5 repetir para todos os produtos
# nan -> not a number