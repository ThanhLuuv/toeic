export interface Question {
  questionNumber: number;
  imageDescription: string;
  choices: {
    A: string;
    B: string;
    C: string;
  };
  correctAnswer: string;
  explanation: string;
  audioScript: string;
  image: string;
}

export const questions: Question[] = [
  {
    "questionNumber": 1,
    "imageDescription": "A black-and-white photo shows a man is holding a briefcase in front of a blank wall. The background is minimal and typical of TOEIC-style test images.",
    "choices": {
      "A": "A man is holding a briefcase.",
      "B": "People are holding a briefcase.",
      "C": "A woman is holding a briefcase."
    },
    "correctAnswer": "A",
    "explanation": "Choice A correctly describes the person's action. Traps include wrong gender, plural form errors, or unrelated actions.",
    "audioScript": "Look at the picture.\nA. A man is holding a briefcase.\nB. People are holding a briefcase.\nC. A woman is holding a briefcase.",
    "image": "https://res.cloudinary.com/deroljhou/image/upload/v1751611280/qm3a2etos7wc3arhyorb.png"
  },
  {
    "questionNumber": 2,
    "imageDescription": "A black-and-white photo shows a man is walking alone in a minimal setting. The background is minimal and typical of TOEIC-style test images.",
    "choices": {
      "A": "A woman is walking alone.",
      "B": "A man is holding a bag",
      "C": "A man is walking alone."
    },
    "correctAnswer": "C",
    "explanation": "Choice C correctly describes the person's action. Traps include wrong gender, plural form errors, or unrelated actions.",
    "audioScript": "Look at the picture.\nA. A woman is walking alone.\nB. A man is holding a bag\nC. A man is walking alone.",
    "image": "https://res.cloudinary.com/deroljhou/image/upload/v1751611290/qdtnkr1ywhq00hhwwazs.png"
  },
  {
    "questionNumber": 3,
    "imageDescription": "A black-and-white photo shows a man is sitting on a bench in front of a blank wall. The background is minimal and typical of TOEIC-style test images.",
    "choices": {
      "A": "A man is standing still",
      "B": "People are sitting on a bench.",
      "C": "A man is sitting on a bench."
    },
    "correctAnswer": "C",
    "explanation": "Choice C correctly describes the person's action. Traps include wrong gender, plural form errors, or unrelated actions.",
    "audioScript": "Look at the picture.\nA. A man is standing still\nB. People are sitting on a bench.\nC. A man is sitting on a bench.",
    "image": "https://res.cloudinary.com/deroljhou/image/upload/v1751611301/p9cfyucjasbezosmnsc8.png"
  },
  {
    "questionNumber": 4,
    "imageDescription": "A black-and-white photo shows a woman is reading a book in a minimal setting. The background is minimal and typical of TOEIC-style test images.",
    "choices": {
      "A": "A man is reading a book.",
      "B": "A woman is reading a book.",
      "C": "People are reading a book."
    },
    "correctAnswer": "B",
    "explanation": "Choice B correctly describes the person's action. Traps include wrong gender, plural form errors, or unrelated actions.",
    "audioScript": "Look at the picture.\nA. A man is reading a book.\nB. A woman is reading a book.\nC. People are reading a book.",
    "image": "https://res.cloudinary.com/deroljhou/image/upload/v1751611313/y9k3tkddhais52sevmqg.png"
  },
  {
    "questionNumber": 5,
    "imageDescription": "A black-and-white photo shows a man is holding a briefcase in an empty space. The background is minimal and typical of TOEIC-style test images.",
    "choices": {
      "A": "A man is using a phone",
      "B": "People are holding a briefcase.",
      "C": "A man is holding a briefcase."
    },
    "correctAnswer": "C",
    "explanation": "Choice C correctly describes the person's action. Traps include wrong gender, plural form errors, or unrelated actions.",
    "audioScript": "Look at the picture.\nA. A man is using a phone\nB. People are holding a briefcase.\nC. A man is holding a briefcase.",
    "image": "https://res.cloudinary.com/deroljhou/image/upload/v1751611323/dgfmp9pihcd0ozz0rwti.png"
  },
  {
    "questionNumber": 6,
    "imageDescription": "A black-and-white photo shows a man is holding a briefcase in a minimal setting. The background is minimal and typical of TOEIC-style test images.",
    "choices": {
      "A": "A woman is holding a briefcase.",
      "B": "A man is holding a briefcase.",
      "C": "A man is holding a bag"
    },
    "correctAnswer": "B",
    "explanation": "Choice B correctly describes the person's action. Traps include wrong gender, plural form errors, or unrelated actions.",
    "audioScript": "Look at the picture.\nA. A woman is holding a briefcase.\nB. A man is holding a briefcase.\nC. A man is holding a bag",
    "image": "https://res.cloudinary.com/deroljhou/image/upload/v1751611334/stp45jhiz6glcabzjc0z.png"
  },
  {
    "questionNumber": 7,
    "imageDescription": "A black-and-white photo shows a woman is reading a book in an empty space. The background is minimal and typical of TOEIC-style test images.",
    "choices": {
      "A": "People are reading a book.",
      "B": "A woman is opening a door",
      "C": "A woman is reading a book."
    },
    "correctAnswer": "C",
    "explanation": "Choice C correctly describes the person's action. Traps include wrong gender, plural form errors, or unrelated actions.",
    "audioScript": "Look at the picture.\nA. People are reading a book.\nB. A woman is opening a door\nC. A woman is reading a book.",
    "image": "https://res.cloudinary.com/deroljhou/image/upload/v1751611346/y6aa1omvelz7fvl5hzpe.png"
  },
  {
    "questionNumber": 8,
    "imageDescription": "A black-and-white photo shows a man is walking alone in an empty space. The background is minimal and typical of TOEIC-style test images.",
    "choices": {
      "A": "A man is walking alone.",
      "B": "People are walking alone.",
      "C": "A woman is walking alone."
    },
    "correctAnswer": "A",
    "explanation": "Choice A correctly describes the person's action. Traps include wrong gender, plural form errors, or unrelated actions.",
    "audioScript": "Look at the picture.\nA. A man is walking alone.\nB. People are walking alone.\nC. A woman is walking alone.",
    "image": "https://res.cloudinary.com/deroljhou/image/upload/v1751611355/hw7xjbvrtslf8sfyuxk8.png"
  },
  {
    "questionNumber": 9,
    "imageDescription": "A black-and-white photo shows a woman is reading a book in front of a blank wall. The background is minimal and typical of TOEIC-style test images.",
    "choices": {
      "A": "A man is reading a book.",
      "B": "People are reading a book.",
      "C": "A woman is reading a book."
    },
    "correctAnswer": "C",
    "explanation": "Choice C correctly describes the person's action. Traps include wrong gender, plural form errors, or unrelated actions.",
    "audioScript": "Look at the picture.\nA. A man is reading a book.\nB. People are reading a book.\nC. A woman is reading a book.",
    "image": "https://res.cloudinary.com/deroljhou/image/upload/v1751611366/s3aaywktc3m0mluwg2qz.png"
  },
  {
    "questionNumber": 10,
    "imageDescription": "A black-and-white photo shows a man is talking on the phone with a plain background. The background is minimal and typical of TOEIC-style test images.",
    "choices": {
      "A": "A man is talking on the phone.",
      "B": "People are talking on the phone.",
      "C": "A man is using a phone"
    },
    "correctAnswer": "A",
    "explanation": "Choice A correctly describes the person's action. Traps include wrong gender, plural form errors, or unrelated actions.",
    "audioScript": "Look at the picture.\nA. A man is talking on the phone.\nB. People are talking on the phone.\nC. A man is using a phone",
    "image": "https://res.cloudinary.com/deroljhou/image/upload/v1751611377/mjv7r73uoisjyxfybabz.png"
  },
  {
    "questionNumber": 11,
    "imageDescription": "A black-and-white photo shows a woman is smiling at the camera in an empty space. The background is minimal and typical of TOEIC-style test images.",
    "choices": {
      "A": "A woman is smiling at the camera.",
      "B": "People are smiling at the camera.",
      "C": "A woman is drinking coffee"
    },
    "correctAnswer": "A",
    "explanation": "Choice A correctly describes the person's action. Traps include wrong gender, plural form errors, or unrelated actions.",
    "audioScript": "Look at the picture.\nA. A woman is smiling at the camera.\nB. People are smiling at the camera.\nC. A woman is drinking coffee",
    "image": "https://res.cloudinary.com/deroljhou/image/upload/v1751611387/ryfs10a5u7axerr6btmk.png"
  },
  {
    "questionNumber": 12,
    "imageDescription": "A black-and-white photo shows a man is walking alone in a minimal setting. The background is minimal and typical of TOEIC-style test images.",
    "choices": {
      "A": "A man is walking alone.",
      "B": "People are walking alone.",
      "C": "A man is reading a newspaper"
    },
    "correctAnswer": "A",
    "explanation": "Choice A correctly describes the person's action. Traps include wrong gender, plural form errors, or unrelated actions.",
    "audioScript": "Look at the picture.\nA. A man is walking alone.\nB. People are walking alone.\nC. A man is reading a newspaper",
    "image": "https://res.cloudinary.com/deroljhou/image/upload/v1751611402/htsdz54y9jqsylen5jli.png"
  },
  {
    "questionNumber": 13,
    "imageDescription": "A black-and-white photo shows a man is tying his shoelaces with a plain background. The background is minimal and typical of TOEIC-style test images.",
    "choices": {
      "A": "A man is tying his shoelaces.",
      "B": "A woman is tying his shoelaces.",
      "C": "People are tying his shoelaces."
    },
    "correctAnswer": "A",
    "explanation": "Choice A correctly describes the person's action. Traps include wrong gender, plural form errors, or unrelated actions.",
    "audioScript": "Look at the picture.\nA. A man is tying his shoelaces.\nB. A woman is tying his shoelaces.\nC. People are tying his shoelaces.",
    "image": "https://res.cloudinary.com/deroljhou/image/upload/v1751611414/nkjjrzwesfxnu5vivvov.png"
  },
  {
    "questionNumber": 14,
    "imageDescription": "A black-and-white photo shows a man is holding a briefcase in a minimal setting. The background is minimal and typical of TOEIC-style test images.",
    "choices": {
      "A": "A man is holding a briefcase.",
      "B": "People are holding a briefcase.",
      "C": "A woman is holding a briefcase."
    },
    "correctAnswer": "A",
    "explanation": "Choice A correctly describes the person's action. Traps include wrong gender, plural form errors, or unrelated actions.",
    "audioScript": "Look at the picture.\nA. A man is holding a briefcase.\nB. People are holding a briefcase.\nC. A woman is holding a briefcase.",
    "image": "https://res.cloudinary.com/deroljhou/image/upload/v1751611424/vlxqnw9qph8mgoeuppnz.png"
  },
  {
    "questionNumber": 15,
    "imageDescription": "A black-and-white photo shows a woman is writing in a notebook in an empty space. The background is minimal and typical of TOEIC-style test images.",
    "choices": {
      "A": "People are writing in a notebook.",
      "B": "A woman is writing in a notebook.",
      "C": "A man is writing in a notebook."
    },
    "correctAnswer": "B",
    "explanation": "Choice B correctly describes the person's action. Traps include wrong gender, plural form errors, or unrelated actions.",
    "audioScript": "Look at the picture.\nA. People are writing in a notebook.\nB. A woman is writing in a notebook.\nC. A man is writing in a notebook.",
    "image": "https://res.cloudinary.com/deroljhou/image/upload/v1751611436/bx5qdbnwxkqd52l5ffjp.png"
  },
  {
    "questionNumber": 16,
    "imageDescription": "A black-and-white photo shows a woman is writing in a notebook in an empty space. The background is minimal and typical of TOEIC-style test images.",
    "choices": {
      "A": "A woman is reading a newspaper",
      "B": "People are writing in a notebook.",
      "C": "A woman is writing in a notebook."
    },
    "correctAnswer": "C",
    "explanation": "Choice C correctly describes the person's action. Traps include wrong gender, plural form errors, or unrelated actions.",
    "audioScript": "Look at the picture.\nA. A woman is reading a newspaper\nB. People are writing in a notebook.\nC. A woman is writing in a notebook.",
    "image": "https://res.cloudinary.com/deroljhou/image/upload/v1751611447/yy1wqywmna5ec5notjih.png"
  },
  {
    "questionNumber": 17,
    "imageDescription": "A black-and-white photo shows a man is walking alone with a plain background. The background is minimal and typical of TOEIC-style test images.",
    "choices": {
      "A": "People are walking alone.",
      "B": "A man is opening a door",
      "C": "A man is walking alone."
    },
    "correctAnswer": "C",
    "explanation": "Choice C correctly describes the person's action. Traps include wrong gender, plural form errors, or unrelated actions.",
    "audioScript": "Look at the picture.\nA. People are walking alone.\nB. A man is opening a door\nC. A man is walking alone.",
    "image": "https://res.cloudinary.com/deroljhou/image/upload/v1751611458/ukig41khm247kqc9mzxd.png"
  },
  {
    "questionNumber": 18,
    "imageDescription": "A black-and-white photo shows a man is holding a briefcase in front of a blank wall. The background is minimal and typical of TOEIC-style test images.",
    "choices": {
      "A": "People are holding a briefcase.",
      "B": "A man is opening a door",
      "C": "A man is holding a briefcase."
    },
    "correctAnswer": "C",
    "explanation": "Choice C correctly describes the person's action. Traps include wrong gender, plural form errors, or unrelated actions.",
    "audioScript": "Look at the picture.\nA. People are holding a briefcase.\nB. A man is opening a door\nC. A man is holding a briefcase.",
    "image": "https://res.cloudinary.com/deroljhou/image/upload/v1751611469/vpth3rnuxqmbbkstgs9q.png"
  },
  {
    "questionNumber": 19,
    "imageDescription": "A black-and-white photo shows a woman is standing by a wall in front of a blank wall. The background is minimal and typical of TOEIC-style test images.",
    "choices": {
      "A": "A woman is standing still",
      "B": "A man is standing by a wall.",
      "C": "A woman is standing by a wall."
    },
    "correctAnswer": "C",
    "explanation": "Choice C correctly describes the person's action. Traps include wrong gender, plural form errors, or unrelated actions.",
    "audioScript": "Look at the picture.\nA. A woman is standing still\nB. A man is standing by a wall.\nC. A woman is standing by a wall.",
    "image": "https://res.cloudinary.com/deroljhou/image/upload/v1751611481/fij5v3glffacqdugjgbf.png"
  },
  {
    "questionNumber": 20,
    "imageDescription": "A black-and-white photo shows a man is walking alone in an empty space. The background is minimal and typical of TOEIC-style test images.",
    "choices": {
      "A": "A woman is walking alone.",
      "B": "A man is walking alone.",
      "C": "People are walking alone."
    },
    "correctAnswer": "B",
    "explanation": "Choice B correctly describes the person's action. Traps include wrong gender, plural form errors, or unrelated actions.",
    "audioScript": "Look at the picture.\nA. A woman is walking alone.\nB. A man is walking alone.\nC. People are walking alone.",
    "image": "https://res.cloudinary.com/deroljhou/image/upload/v1751611491/xfujsnsqgshv3xxvlz1a.png"
  },
  {
    "questionNumber": 21,
    "imageDescription": "A black-and-white photo shows a man is sitting on a bench in an empty space. The background is minimal and typical of TOEIC-style test images.",
    "choices": {
      "A": "A man is using a phone",
      "B": "A woman is sitting on a bench.",
      "C": "A man is sitting on a bench."
    },
    "correctAnswer": "C",
    "explanation": "Choice C correctly describes the person's action. Traps include wrong gender, plural form errors, or unrelated actions.",
    "audioScript": "Look at the picture.\nA. A man is using a phone\nB. A woman is sitting on a bench.\nC. A man is sitting on a bench.",
    "image": "https://res.cloudinary.com/deroljhou/image/upload/v1751611502/xwxptlrnmdjd32qdteng.png"
  },
  {
    "questionNumber": 22,
    "imageDescription": "A black-and-white photo shows a woman is reading a book with a plain background. The background is minimal and typical of TOEIC-style test images.",
    "choices": {
      "A": "A woman is reading a book.",
      "B": "People are reading a book.",
      "C": "A woman is reading a newspaper"
    },
    "correctAnswer": "A",
    "explanation": "Choice A correctly describes the person's action. Traps include wrong gender, plural form errors, or unrelated actions.",
    "audioScript": "Look at the picture.\nA. A woman is reading a book.\nB. People are reading a book.\nC. A woman is reading a newspaper",
    "image": "https://res.cloudinary.com/deroljhou/image/upload/v1751611514/uz1zylrg2qvesnmhpsw9.png"
  },
  {
    "questionNumber": 23,
    "imageDescription": "A black-and-white photo shows a woman is drinking from a bottle in front of a blank wall. The background is minimal and typical of TOEIC-style test images.",
    "choices": {
      "A": "People are drinking from a bottle.",
      "B": "A woman is opening a door",
      "C": "A woman is drinking from a bottle."
    },
    "correctAnswer": "C",
    "explanation": "Choice C correctly describes the person's action. Traps include wrong gender, plural form errors, or unrelated actions.",
    "audioScript": "Look at the picture.\nA. People are drinking from a bottle.\nB. A woman is opening a door\nC. A woman is drinking from a bottle.",
    "image": "https://res.cloudinary.com/deroljhou/image/upload/v1751611525/olqbx56nm8enpo4lbapx.png"
  },
  {
    "questionNumber": 24,
    "imageDescription": "A black-and-white photo shows a man is talking on the phone in a minimal setting. The background is minimal and typical of TOEIC-style test images.",
    "choices": {
      "A": "A man is talking on the phone.",
      "B": "A man is holding a bag",
      "C": "People are talking on the phone."
    },
    "correctAnswer": "A",
    "explanation": "Choice A correctly describes the person's action. Traps include wrong gender, plural form errors, or unrelated actions.",
    "audioScript": "Look at the picture.\nA. A man is talking on the phone.\nB. A man is holding a bag\nC. People are talking on the phone.",
    "image": "https://res.cloudinary.com/deroljhou/image/upload/v1751611534/ygswrprczfqjkct1fedb.png"
  },
  {
    "questionNumber": 25,
    "imageDescription": "A black-and-white photo shows a woman is smiling at the camera in a minimal setting. The background is minimal and typical of TOEIC-style test images.",
    "choices": {
      "A": "A woman is reading a newspaper",
      "B": "People are smiling at the camera.",
      "C": "A woman is smiling at the camera."
    },
    "correctAnswer": "C",
    "explanation": "Choice C correctly describes the person's action. Traps include wrong gender, plural form errors, or unrelated actions.",
    "audioScript": "Look at the picture.\nA. A woman is reading a newspaper\nB. People are smiling at the camera.\nC. A woman is smiling at the camera.",
    "image": "https://res.cloudinary.com/deroljhou/image/upload/v1751611544/orsvkgilkdqedaovecch.png"
  },
  {
    "questionNumber": 26,
    "imageDescription": "A black-and-white photo shows a man is sitting on a bench in front of a blank wall. The background is minimal and typical of TOEIC-style test images.",
    "choices": {
      "A": "A man is sitting on a bench.",
      "B": "A man is drinking coffee",
      "C": "A woman is sitting on a bench."
    },
    "correctAnswer": "A",
    "explanation": "Choice A correctly describes the person's action. Traps include wrong gender, plural form errors, or unrelated actions.",
    "audioScript": "Look at the picture.\nA. A man is sitting on a bench.\nB. A man is drinking coffee\nC. A woman is sitting on a bench.",
    "image": "https://res.cloudinary.com/deroljhou/image/upload/v1751611556/msxv7ilprbtlhf14epob.png"
  },
  {
    "questionNumber": 27,
    "imageDescription": "A black-and-white photo shows a man is sitting on a bench in an empty space. The background is minimal and typical of TOEIC-style test images.",
    "choices": {
      "A": "People are sitting on a bench.",
      "B": "A woman is sitting on a bench.",
      "C": "A man is sitting on a bench."
    },
    "correctAnswer": "C",
    "explanation": "Choice C correctly describes the person's action. Traps include wrong gender, plural form errors, or unrelated actions.",
    "audioScript": "Look at the picture.\nA. People are sitting on a bench.\nB. A woman is sitting on a bench.\nC. A man is sitting on a bench.",
    "image": "https://res.cloudinary.com/deroljhou/image/upload/v1751611567/mjhjvvkn7ixc0ceryqut.png"
  },
  {
    "questionNumber": 28,
    "imageDescription": "A black-and-white photo shows a man is tying his shoelaces in an empty space. The background is minimal and typical of TOEIC-style test images.",
    "choices": {
      "A": "A man is tying his shoelaces.",
      "B": "People are tying his shoelaces.",
      "C": "A woman is tying his shoelaces."
    },
    "correctAnswer": "A",
    "explanation": "Choice A correctly describes the person's action. Traps include wrong gender, plural form errors, or unrelated actions.",
    "audioScript": "Look at the picture.\nA. A man is tying his shoelaces.\nB. People are tying his shoelaces.\nC. A woman is tying his shoelaces.",
    "image": "https://res.cloudinary.com/deroljhou/image/upload/v1751611577/emjnhqdqahzv2kza9s9i.png"
  },
  {
    "questionNumber": 29,
    "imageDescription": "A black-and-white photo shows a woman is writing in a notebook with a plain background. The background is minimal and typical of TOEIC-style test images.",
    "choices": {
      "A": "A man is writing in a notebook.",
      "B": "People are writing in a notebook.",
      "C": "A woman is writing in a notebook."
    },
    "correctAnswer": "C",
    "explanation": "Choice C correctly describes the person's action. Traps include wrong gender, plural form errors, or unrelated actions.",
    "audioScript": "Look at the picture.\nA. A man is writing in a notebook.\nB. People are writing in a notebook.\nC. A woman is writing in a notebook.",
    "image": "https://res.cloudinary.com/deroljhou/image/upload/v1751611588/jkd1mcirdhifahknkaqq.png"
  },
  {
    "questionNumber": 30,
    "imageDescription": "A black-and-white photo shows a woman is drinking from a bottle with a plain background. The background is minimal and typical of TOEIC-style test images.",
    "choices": {
      "A": "A woman is drinking from a bottle.",
      "B": "A man is drinking from a bottle.",
      "C": "People are drinking from a bottle."
    },
    "correctAnswer": "A",
    "explanation": "Choice A correctly describes the person's action. Traps include wrong gender, plural form errors, or unrelated actions.",
    "audioScript": "Look at the picture.\nA. A woman is drinking from a bottle.\nB. A man is drinking from a bottle.\nC. People are drinking from a bottle.",
    "image": "https://res.cloudinary.com/deroljhou/image/upload/v1751611598/d61asfsbfwwsrftde2af.png"
  }
]

// Chia thành các bài test, mỗi bài 6 câu
export const tests: Question[][] = [];
for (let i = 0; i < questions.length; i += 6) {
  tests.push(questions.slice(i, i + 6));
}

export const wordTranslations: { [key: string]: string } = {
  person: 'người',
  reading: 'đọc',
  book: 'sách',
  writing: 'viết',
  letter: 'thư',
  using: 'sử dụng',
  computer: 'máy tính',
  painting: 'vẽ',
  picture: 'tranh',
  dog: 'chó',
  running: 'chạy',
  park: 'công viên',
  sleeping: 'ngủ',
  couch: 'ghế sofa',
  eating: 'ăn',
  food: 'thức ăn',
  chasing: 'đuổi theo',
  cat: 'mèo',
};