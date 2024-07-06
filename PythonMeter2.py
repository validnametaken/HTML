import tkinter as tk
import numpy as np
import pyaudio
from numpy.polynomial import Polynomial
from scipy.signal import bilinear, lfilter
import pygame.mixer

CHUNKS = [4096, 9600]
CHUNK = CHUNKS[1]
FORMAT = pyaudio.paInt16
CHANNEL = 1
RATES = [44100, 48000]
RATE = RATES[1]

pygame.mixer.init()
alarm_sound = pygame.mixer.Sound("alarm.mp3")

def A_weighting(fs: float) -> tuple[np.ndarray, np.ndarray]:
    f1 = 20.598997
    f2 = 107.65265
    f3 = 737.86223
    f4 = 12194.217
    a1000 = 1.9997

    nums = Polynomial(((2 * np.pi * f4)**2 * 10**(a1000 / 20), 0, 0, 0, 0))
    dens = (
        Polynomial((1, 4 * np.pi * f4, (2 * np.pi * f4)**2)) *
        Polynomial((1, 4 * np.pi * f1, (2 * np.pi * f1)**2)) *
        Polynomial((1, 2 * np.pi * f3)) *
        Polynomial((1, 2 * np.pi * f2))
    )
    return bilinear(nums.coef, dens.coef, fs)

def rms_flat(a: np.ndarray) -> float:
    return np.sqrt(a.dot(a) / len(a))

class Meter:
    def __init__(self) -> None:
        self.pa = pyaudio.PyAudio()
        self.stream = self.pa.open(
            format=FORMAT,
            channels=CHANNEL,
            rate=RATE,
            input=True,
            frames_per_buffer=CHUNK,
        )
        self.numerator, self.denominator = A_weighting(RATE)
        self.offset = 0  # Initialize offset to 0
        self.max_decibel = 0

    def __enter__(self) -> 'Meter':
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        self.stream.stop_stream()
        self.stream.close()
        self.pa.terminate()

    def listen(self, offset: int) -> float:
        block = self.stream.read(CHUNK)
        decoded_block = np.frombuffer(block, dtype=np.int16)
        y = lfilter(self.numerator, self.denominator, decoded_block)
        new_decibel = 20 * np.log10(rms_flat(y)) + offset
        self.max_decibel = max(self.max_decibel, new_decibel)
        return new_decibel

class GUI:
    def __init__(self, meter: Meter) -> None:
        self.meter = meter

        self.root = root = tk.Tk()
        root.title('Decibel Meter')

        # Create a frame with grid layout
        self.frame = tk.Frame(root, bg='#121212')
        self.frame.pack(expand=True, fill='both')

        # Weight options to make the frame expand as the window size changes
        self.frame.grid_columnconfigure(0, weight=1)
        self.frame.grid_rowconfigure(0, weight=1)

        root.protocol('WM_DELETE_WINDOW', self.close)
        self.app_closed = False

        # Canvas for volume display
        self.canvas = tk.Canvas(self.frame, bg='#121212', highlightthickness=0)
        self.canvas.grid(row=0, column=0, pady=(20, 10), sticky='nsew')

        # Label for current decibel level
        self.db_label = tk.Label(self.frame, text='Current dB: -', font=('Helvetica', 19), bg='#121212', fg='white')
        self.db_label.grid(row=1, column=0, pady=10, sticky='nsew')

        # Scale for offset adjustment
        self.offset_scale = tk.Scale(self.frame, from_=-20, to=20, orient=tk.HORIZONTAL, resolution=1, command=self.update_offset, length=200, bg='#121212', fg='white', highlightbackground='#121212')
        self.offset_scale.set(0)  # Set initial offset to 0
        self.offset_scale.grid(row=2, column=0, pady=(0, 20), sticky='nsew')

        # Call the resize method when the window size changes
        root.bind("<Configure>", self.resize)

        # Initial size of the canvas
        self.canvas_width = self.canvas.winfo_reqwidth()
        self.canvas_height = self.canvas.winfo_reqheight()

        # Initial width and height of the meter bar
        self.bar_width = 100
        self.bar_height = 200

    def close(self) -> None:
        self.app_closed = True

    def run(self) -> None:
        while not self.app_closed:
            new_decibel = self.meter.listen(self.offset_scale.get())
            self.update(new_decibel)
            if new_decibel > 45:
                alarm_sound.play()  # Play the alarm sound if the decibel level exceeds 50 dB
            self.root.update()

    def update(self, new_decibel: float) -> None:
        volume_height = min((new_decibel / 120) * self.bar_height, self.bar_height)
        self.canvas.delete('meter_bar')  # Clear previously drawn meter bar
        bar_x = (self.canvas_width - self.bar_width) / 2  # Center the meter bar horizontally
        self.canvas.create_rectangle(bar_x, self.canvas_height - volume_height, bar_x + self.bar_width, self.canvas_height, fill='#4CAF50', outline='', tags='meter_bar')

        if new_decibel > 45:
            fill_color = '#FF0000'
        elif new_decibel > 40:
            fill_color = '#FFA500'
        else:
            fill_color = '#4CAF50'

        self.canvas.create_rectangle(bar_x, self.canvas_height - volume_height, bar_x + self.bar_width, self.canvas_height, fill=fill_color, outline='', tags='meter_bar')

        self.db_label.config(text=f'Current dB: {new_decibel:.2f}')

    def resize(self, event) -> None:
        # Get the new size of the canvas when the window is resized
        new_width = self.canvas.winfo_width()
        new_height = self.canvas.winfo_height()

        # Update the canvas size
        self.canvas_width = new_width
        self.canvas_height = new_height

    def update_offset(self, value) -> None:
        # Update the offset value when the scale widget is adjusted
        new_offset = int(value)
        self.meter.offset = new_offset
        # Optionally, you can update the decibel display here if needed

def main() -> None:
    with Meter() as meter:
        gui = GUI(meter)
        gui.run()

if __name__ == '__main__':
    main()

