import codecs

files = [
    r'e:\„‰’… «·Ã‰ÌœÌ\app\live\LiveWhiteboardStudent.js',
    r'e:\„‰’… «·Ã‰ÌœÌ\app\teacher-assistant\whiteboard\QuranOrderGameOverlay.js',
    r'e:\„‰’… «·Ã‰ÌœÌ\app\virtual-classroom\page.js'
]

for filepath in files:
    try:
        with open(filepath, 'rb') as f:
            content = f.read()
            
        text = ''
        if content.startswith(codecs.BOM_UTF16_LE):
            text = content.decode('utf-16-le')
            print(f'Converted {filepath} from UTF-16-LE')
        elif content.startswith(codecs.BOM_UTF16_BE):
            text = content.decode('utf-16-be')
            print(f'Converted {filepath} from UTF-16-BE')
        elif content.startswith(codecs.BOM_UTF8):
            text = content.decode('utf-8-sig')
            print(f'Converted {filepath} from UTF-8 BOM')
        else:
            try:
                text = content.decode('utf-8')
                print(f'{filepath} is already UTF-8')
            except UnicodeDecodeError:
                try:
                    text = content.decode('utf-16')
                    print(f'Converted {filepath} from UTF-16')
                except:
                    text = content.decode('windows-1256')
                    print(f'Converted {filepath} from windows-1256')
                    
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(text)
    except Exception as e:
        print(f'Error processing {filepath}: {e}')
