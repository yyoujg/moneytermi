# SFX Sources

## ObsydianX - Interface SFX Pack 1 (CC0)

- Source page: https://obsydianx.itch.io/interface-sfx-pack-1
- Author: ObsydianX
- Asset license shown on source page: Creative Commons Zero v1.0 Universal
- CC0 legal text: https://creativecommons.org/publicdomain/zero/1.0/
- Downloaded package: `Interface SFX Pack 1 OGG` from itch.io
- Package SHA-256: `363431f4b1ff01d0400c217f582a82c0e87bdacee828df0b7b0f65bf668d8865`
- Processing: extracted OGG, removed leading/trailing silence at `-50dB`, reduced volume to `65%`, converted to mono MP3 at 44.1kHz/64kbps.

| App file | Original file in package | Final duration | Final peak |
|---|---|---:|---:|
| `correct.mp3` | `Ogg/Confirm_tones/style2/confirm_style_2_007.ogg` | 0.624s | -2.3dB |
| `wrong.mp3` | `Ogg/Error_tones/style5/error_style_5_007.ogg` | 0.506s | -7.4dB |
| `lesson.mp3` | `Ogg/Confirm_tones/style3/confirm_style_3_007.ogg` | 0.930s | -2.1dB |

The app also applies playback gain and a short repeat limiter in `src/lib/feedback.ts`.
