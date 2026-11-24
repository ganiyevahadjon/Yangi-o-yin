# Dungeon Escape - 2D Platformer / Puzzle O'yini

Ushbu loyiha berilgan **Texnik Topshiriq (TZ)** asosida noldan ishlab chiqilgan to'liq 2D Platformer-jumboq o'yini hisoblanadi.

---

## 1. Asosiy Xususiyatlar va Mexanikalar

### 1.1 Player Controller va Fiziologiya
- **Silliq tezlanish va tormozlanish (Acceleration & Deceleration inertia)**: Harakatda inersiya hissi mavjud.
- **Jump Buffering (0.15s)**: Yerga tegishdan oldin Space bosilsa, yerga tushgach avtomatik sakraydi.
- **Coyote Time (0.10s)**: Platformadan havo bo'shlig'iga tushib ketgandan keyin qisqa vaqt davomida sakrash imkoniyati.
- **Variable Jump Height**: Space tugmasini erta qo'yib yuborish orqali pastroq sakrash (short hop) imkoniyati.
- **Animatsiyalar**: `Idle`, `Walk`, `Jump`, `Fall`, `Hurt`, `Die` uchun alohida animatsiya holatlari.

### 1.2 Tuzoqlar (4 tur)
1. **Harakatlanuvchi Platforma (Moving Platform)**: Belgilangan koordinatalar (waypoint) bo'ylab harakatlanadi; o'yinchi va og'ir qutilarni o'zi bilan tashiydi.
2. **Qulab tushuvchi pol (Crumbling Platform)**: Qadam qo'yilgandan 0.6s o'tib qulaydi, 2.4s dan so'ng chang zarrachalari bilan qayta tiklanadi.
3. **Tikanlar (Spikes)**: Tegilganda 1 ta jonga zarar yetkazadi, orqaga uradi va i-frame beradi.
4. **Aylanuvchi Tuzoqlar (Saw Blades & Pendulums)**: Rels bo'ylab harakatlanuvchi aylanma arra pichoqlari va arqonga osilgan garmonik tebranuvchi mayatnik boltalari.

### 1.3 Jumboqlar va Interaktiv Ob'yektlar (3 tur)
1. **Bosim Plitasi (Pressure Plate)**: O'yinchi yoki quti bosganda temir panjarali eshiklarni ochadi.
2. **Tortiladigan / Suriladigan Quti (Pushable / Pullable Box)**: O'yinchi qutini oldinga surishi yoki `E` tugmasini bosib ushlab orqaga tortishi mumkin. Qutilarni tikanlar ustiga tashlab ko'prik qilish yoki plitalarga qo'yish mumkin.
3. **Kalitli Eshiklar va Chiqish Portali**: Oltin kalitlarni to'plash orqali qulflangan eshiklar va chiqish portalini ochish.

### 1.4 Boshqa Tizimlar
- **3 ta Yurak / Jon**: Zindon tuzoqlaridan omon qolish uchun 3 ta jon.
- **Checkpoint Tizimi**: Faollashtiriladigan runik altarlar. O'lim sodir bo'lganda eng oxirgi checkpointda qayta tug'iladi.
- **1–3 Yulduzli Baholash Tizimi**: Vaqt (Par Time), to'plangan tangalar/gems va o'limlar soniga qarab hisoblanadi.
- **Save / Load Tizimi**: `localStorage` + JSON fayl ko'rinishida eksport/import qilish imkoniyati.
- **Procedural WebAudio Synthesizer**: Tashqi og'ir audio fayllarsiz to'liq Web Audio API orqali sintez qilingan retro musiqa (BGM) va 12 xil ovoz effektlari (SFX).

---

## 2. Handcrafted 8 ta Level
- **Level 1: The Awakening** — Boshqaruv, Coyote time, birinchi kalit.
- **Level 2: Spike Descent** — Tikanlar ustidan ehtiyotkor sakrash, jump buffering.
- **Level 3: The Heavy Burden** — Og'ir qutini surish va bosim plitasiga qo'yish.
- **Level 4: Crumbling Abyss** — Qulab tushuvchi pollar va tubsizlik.
- **Level 5: Sawblade Alley** — Aylanuvchi arralar va tezkor yugurish.
- **Level 6: Pendulum Crypt** — Tebranuvchi mayatnik boltalari va harakatlanuvchi platformalar.
- **Level 7: Labyrinth of Gears** — Qutini harakatlanuvchi platformaga ortib tikanlar uzra o'tkazish.
- **Level 8: The Dungeon Core** — Barcha tuzoq va jumboqlarning yakuniy murakkab sinovi.

---

## 3. Boshqaruv Klavishlari
| Klavish | Funksiya |
| :--- | :--- |
| `A` / `D` yoki `←` / `→` | Chapga / O'ngga yurish, qutini surish |
| `Space` yoki `W` / `↑` | Sakrash |
| `E` yoki `Enter` | Qutini ushlab tortish/surish |
| `Esc` yoki `P` | Pauza menyusi (Restart Level, Sozlamalar) |

---

## 4. Ishga Tushirish va O'ynash

### 4.1 Windows (.exe desktop ilova)
`launch-windows.bat` faylini ikki marta bosing yoki terminalda:
```bash
npm start
```

### 4.2 Web (Brauzerda o'ynash)
To'g'ridan-to'g'ri `index.html` faylini istalgan brauzerda (Chrome, Edge, Firefox) ochishingiz mumkin yoki:
```bash
npm run serve
```
va brauzerda `http://localhost:3000` manziliga kiring.

### 4.3 Linux
`launch-linux.sh` skriptini ishga tushiring:
```bash
chmod +x launch-linux.sh
./launch-linux.sh
```
