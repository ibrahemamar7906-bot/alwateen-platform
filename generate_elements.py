import urllib.request
import json
import codecs

url = 'https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/master/PeriodicTableJSON.json'
req = urllib.request.urlopen(url)
data = json.loads(req.read().decode('utf-8'))

cat_ar = {
    'diatomic nonmetal': 'لا فلزات',
    'noble gas': 'غازات نبيلة',
    'alkali metal': 'فلزات قلوية',
    'alkaline earth metal': 'فلزات قلوية ترابية',
    'metalloid': 'أشباه فلزات',
    'polyatomic nonmetal': 'لا فلزات',
    'post-transition metal': 'فلزات ضعيفة',
    'transition metal': 'فلزات انتقالية',
    'lanthanide': 'لانثانيدات',
    'actinide': 'أكتينيدات'
}

color_map = {
    'diatomic nonmetal': '#fca5a5',
    'noble gas': '#c4b5fd',
    'alkali metal': '#fcd34d',
    'alkaline earth metal': '#fde047',
    'metalloid': '#86efac',
    'polyatomic nonmetal': '#fca5a5',
    'post-transition metal': '#cbd5e1',
    'transition metal': '#fdba74',
    'lanthanide': '#f9a8d4',
    'actinide': '#fbcfe8'
}

ar_names = {
    'H': 'هيدروجين', 'He': 'هيليوم', 'Li': 'ليثيوم', 'Be': 'بيريليوم', 'B': 'بورون', 'C': 'كربون', 'N': 'نيتروجين', 'O': 'أكسجين', 'F': 'فلور', 'Ne': 'نيون',
    'Na': 'صوديوم', 'Mg': 'ماغنيسيوم', 'Al': 'ألومنيوم', 'Si': 'سيليكون', 'P': 'فوسفور', 'S': 'كبريت', 'Cl': 'كلور', 'Ar': 'أرجون', 'K': 'بوتاسيوم', 'Ca': 'كالسيوم',
    'Sc': 'سكانديوم', 'Ti': 'تيتانيوم', 'V': 'فاناديوم', 'Cr': 'كروم', 'Mn': 'منجنيز', 'Fe': 'حديد', 'Co': 'كوبالت', 'Ni': 'نيكل', 'Cu': 'نحاس', 'Zn': 'خارصين',
    'Ag': 'فضة', 'Au': 'ذهب', 'Pt': 'بلاتين', 'Hg': 'زئبق', 'Pb': 'رصاص', 'U': 'يورانيوم'
}

elements_list = []
for el in data['elements']:
    cat = el.get('category', '').lower()
    ar_cat = 'أخرى'
    c_color = '#e2e8f0'
    for k in cat_ar:
        if k in cat:
            ar_cat = cat_ar[k]
            c_color = color_map[k]
            break
            
    elements_list.append({
        'num': el['number'],
        'sym': el['symbol'],
        'name': ar_names.get(el['symbol'], el['name']),
        'mass': round(el['atomic_mass'], 3),
        'cat': ar_cat,
        'state': 'غاز' if el.get('phase')=='Gas' else 'سائل' if el.get('phase')=='Liquid' else 'صلب',
        'config': el.get('electron_configuration', ''),
        'col': el.get('xpos', 1),
        'row': el.get('ypos', 1),
        'color': c_color
    })

output = 'const elementsData = ' + json.dumps(elements_list, ensure_ascii=False, indent=2) + ';\nexport default elementsData;'
with codecs.open('e:\\منصة الجنيدي\\elementsData.js', 'w', 'utf-8') as f:
    f.write(output)
print("SUCCESS")
