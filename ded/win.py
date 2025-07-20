from pynput import mouse
import pyautogui

def on_click(x, y, button, pressed):
    if pressed:
        print(f"Você clicou na posição: x={x}, y={y}")
          # Para o listener após um clique
        return False

# Inicia o listener
with mouse.Listener(on_click=on_click) as listener:
    listener.join()