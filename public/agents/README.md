# Image Save Guide — 25 Agent Avatars

The 25 images from your message need to be saved as:
```
public/agents/
├── J1.jpg   # The Oracle   — blue bg, round glasses, green/white stripe, leather jacket
├── J2.jpg   # The Architect — yellow bg, black sunglasses, skull tee
├── J3.jpg   # The Jester   — cyan bg, red lenses, Descendents tee
├── J4.jpg   # The Guide    — red bg, black shades, Ramones tee, cigarette ★ DEMO STAR
├── J5.jpg   # The Sentinel — pink bg, round glasses, anarchy necklace
├── J6.jpg   # The Alchemist— green bg, black shades, Motorhead tank, drool
├── J7.jpg   # The Weaver   — orange bg, round glasses, tongue out, red plaid
├── J8.jpg   # The Shadow   — grey bg, blue lenses, suit/tie, red hair
├── J9.jpg   # The Muse     — grey bg, bald, round glasses, tank top
├── J10.jpg  # The Anchor   — purple bg, mohawk, spiked leather jacket
├── J11.jpg  # The Catalyst — blue bg, dreadlocks, Rasta tee
├── J12.jpg  # The Cartographer — green bg, Ramones cap, bubblegum
├── J13.jpg  # The Chronicler  — red bg, gas mask
├── J14.jpg  # The Mirror      — blue bg, fedora, cigar, blonde hair
├── J15.jpg  # The Gardener    — grey bg, green hair, joker vibes
├── J16.jpg  # The Forge       — orange bg, KISS makeup, dark blue hair
├── J17.jpg  # The Lantern     — blue bg, angel wings + halo
├── J18.jpg  # The Void        — purple bg, devil horns, bat wings
├── J19.jpg  # The Storm       — green bg, crown, king robe, scepter
├── J20.jpg  # The Key         — purple bg, headdress, native style
├── J21.jpg  # The Echo        — olive bg, zombie
├── J22.jpg  # The Prism       — blue bg, pirate hat, hook, cigar
├── J23.jpg  # The Root        — green bg, military helmet, rifle
├── J24.jpg  # The Spark       — orange bg, ninja mask, katana
└── J25.jpg  # The Mystery     — blue bg, sailor hat, pipe
```

## How to save (pick one method)

### Method A: Manual drag-drop
1. Right-click each image in your chat → "Save image as..."
2. Name it J1.jpg through J25.jpg (matching the list above)
3. Save all into: `C:\riot-agents\public\agents\`

### Method B: PowerShell one-liner (if images are exported)
```powershell
# After exporting all 25 images to a temp folder:
$images = Get-ChildItem "C:\temp\riot-images\*.jpg"
for ($i = 0; $i -lt $images.Count; $i++) {
    $dest = "C:\riot-agents\public\agents\J$($i+1).jpg"
    Copy-Item $images[$i].FullName $dest
}
```

### Verify after saving:
```powershell
Get-ChildItem C:\riot-agents\public\agents\*.jpg | Measure-Object
# Expected: 25 files
```
