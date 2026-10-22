# Pathway Curriculum Generation Rules

When the user asks you to add a new curriculum (e.g., from a `.txt` file) to the Pathway Interactive System (`data.js`), you MUST adhere to the following rules to prevent errors and ensure full compatibility.

## 1. Overall Structure
The curriculum is composed of an array of objects called "Nodes". Each node represents a step in the pathway.
- Always use an `idCounter` to assign sequential `id` values to nodes.
- Maintain the `unit` number for nodes that belong to a specific unit.
- Push nodes to an array sequentially.

## 2. Node Types and Formats

### 2.1 Unit Start
Used at the beginning of each unit.
```javascript
nodes.push({ 
  id: idCounter++, 
  unit: <unit_number>, 
  title: '<Unit Title>', 
  desc: '<Short Description>', 
  type: 'unit_start', 
  icon: '📚', 
  data: {} 
});
```

### 2.2 Lesson / Reading / Story
Used for lessons that contain reading text, vocabulary, and quizzes.
```javascript
nodes.push({
  id: idCounter++, 
  unit: <unit_number>, 
  title: '<Lesson Title>', 
  desc: '<Lesson Description / Type>', 
  type: 'story', 
  icon: '📖', 
  imageUrl: '<Optional image url or leave undefined>',
  data: {
    text: "<The full text of the lesson, formatted with \\n for line breaks>",
    vocab: {
      meaning: [ { w: 'word1', m: 'meaning1' }, ... ], // Optional
      opposite: [ { w: 'word1', m: 'opposite1' }, ... ], // Optional
      plural: [ { w: 'word1', m: 'plural1' }, ... ], // Optional
      singular: [ { w: 'word1', m: 'singular1' }, ... ] // Optional
    },
    quizzes: [ // Optional multiple choice questions
      { 
        q: '<Question Text>', 
        opts: ['<Option 1>', '<Option 2>', '<Option 3>'], 
        correct: '<Exactly matches one of the options>' 
      }
    ]
  }
});
```
**CRITICAL**: In `quizzes`, the `correct` string MUST exactly match one of the items in the `opts` array. A mismatch will break the interactive quiz UI!

### 2.3 Songs / Poems
Used for poetic texts or songs. Format is identical to `story`, but the type is `song`.
```javascript
nodes.push({ 
  id: idCounter++, unit: <unit_number>, title: '<Title>', desc: 'نشيد', type: 'song', icon: '🎵', 
  data: { text: "...", vocab: {...}, quizzes: [...] }
});
```

### 2.4 Standalone Challenges / Quizzes
Used for grammar (أساليب وتراكيب), spelling, or listening exercises.
**For Word Quiz:**
```javascript
nodes.push({ 
  id: idCounter++, unit: <unit_number>, title: '<Title>', desc: 'تحدي', type: 'quiz_word', icon: '📝', 
  data: {
    quizzes: [
      { q: '...', opts: ['...', '...'], correct: '...' }
    ]
  }
});
```

**For Sound/Listening Quiz (TTS):**
Uses the Text-To-Speech system natively to pronounce `soundToPlay`.
```javascript
nodes.push({ 
  id: idCounter++, unit: <unit_number>, title: '<Title>', desc: 'استماع', type: 'quiz_sound', icon: '👂', 
  data: {
    questionText: 'استمع واختر الإجابة الصحيحة',
    soundToPlay: '<The exact Arabic text the TTS should read>',
    options: ['<Option 1>', '<Option 2>', '<Option 3>'],
    correct: '<Exactly matches one of the options>'
  }
});
```

### 2.5 Unit End (Review & Chest)
At the end of every unit, always insert a review and a chest.
```javascript
nodes.push({ id: idCounter++, unit: <unit_number>, title: 'مراجعة الوحدة', desc: 'اختبار', type: 'review', icon: '🏆', data: { quizzes: [...] } });
nodes.push({ id: idCounter++, unit: <unit_number>, title: 'صندوق المكافأة', desc: 'افتح هديتك', type: 'chest', icon: '🎁', data: { badge: 'بطل الوحدة' } });
```

### 2.6 Pathway Finish
At the very end of the curriculum generation function, insert a finish node.
```javascript
nodes.push({ id: idCounter++, unit: <unit_number>, title: 'نهاية المنهج', desc: 'مبارك إتمام المستوى!', type: 'finish', icon: '🎓', data: {} });
```

## 3. Parsing the User's TXT File
When parsing the user's text:
- **Extract Text Carefully:** Ensure the narrative/educational text is cleanly formatted in the `text` property. Use `\n` for spacing.
- **Extract Vocabulary:** If the user provides definitions, opposites, or plurals, strictly categorize them into `vocab.meaning`, `vocab.opposite`, `vocab.plural`, and `vocab.singular`.
- **Extract Quizzes:** Identify multiple-choice questions in the text. Format them accurately into the `quizzes` array. If the user doesn't specify the correct answer clearly, logically deduce it and ensure it's in the `opts` array.
- **Text-To-Speech (TTS) & Pronunciation:** The system natively uses TTS for reading texts and vocabulary words (`vocab` array). When inserting text or vocabulary, retain any provided Arabic diacritics (التشكيل) as it drastically improves TTS pronunciation accuracy.
- **Do NOT truncate content:** Unless instructed otherwise, include the full text and all questions provided by the user.
