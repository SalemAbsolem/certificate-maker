import '../scss/style.scss'; // Импорт SCSS-файла
import noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';

let canvas, ctx;
let textElements = [];
let selectedTextIndex = -1;
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let qualitySlider;
let backgroundImage = null;

// Функция для добавления текста
function addText() {
  const text = document.getElementById('textInput').value;
  if (text) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    textElements.push({
      text: text,
      x: centerX,
      y: centerY,
      color: document.getElementById('textColor').value,
      size: parseInt(document.getElementById('textSize').value),
    });
    document.getElementById('textInput').value = '';
    drawCanvas();
    console.log('Текстовый элемент добавлен:', { text, x: centerX, y: centerY });
  }
}

// Функция для удаления текста
function deleteText() {
  if (selectedTextIndex !== -1) {
    const deletedText = textElements.splice(selectedTextIndex, 1);
    selectedTextIndex = -1;
    drawCanvas();
    console.log('Текстовый элемент удален:', deletedText);
  }
}

// Функция для сохранения изображения
function saveImage() {
  const format = document.getElementById('formatSelect').value;
  const quality = parseInt(qualitySlider.noUiSlider.get()) / 100;

  if (format && quality >= 0.1 && quality <= 1) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    // Устанавливаем размеры временного canvas равными исходному изображению
    tempCanvas.width = backgroundImage.width;
    tempCanvas.height = backgroundImage.height;

    // Рисуем изображение на временном canvas
    tempCtx.drawImage(backgroundImage, 0, 0, tempCanvas.width, tempCanvas.height);

    // Рисуем текст на временном canvas с учетом пропорций
    textElements.forEach((element) => {
      const scaleX = tempCanvas.width / canvas.width;
      const scaleY = tempCanvas.height / canvas.height;

      tempCtx.font = `${element.size * scaleX}px Arial`;
      tempCtx.fillStyle = element.color;
      tempCtx.textAlign = 'center';
      tempCtx.textBaseline = 'middle';
      tempCtx.fillText(element.text, element.x * scaleX, element.y * scaleY);
    });

    // Сохраняем изображение
    const dataURL = tempCanvas.toDataURL(`image/${format}`, quality);
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `certificate.${format}`;
    link.click();
  } else {
    alert('Пожалуйста, выберите корректное качество (от 10 до 100).');
  }
}

// Функция для позиционирования текста
function positionText(position) {
  if (selectedTextIndex !== -1) {
    const element = textElements[selectedTextIndex];
    const textWidth = ctx.measureText(element.text).width;
    const textHeight = element.size;

    switch (position) {
      case 'top-left':
        element.x = textWidth / 2;
        element.y = textHeight / 2;
        break;
      case 'top-center':
        element.x = canvas.width / 2;
        element.y = textHeight / 2;
        break;
      case 'top-right':
        element.x = canvas.width - textWidth / 2;
        element.y = textHeight / 2;
        break;
      case 'center-left':
        element.x = textWidth / 2;
        element.y = canvas.height / 2;
        break;
      case 'center':
        element.x = canvas.width / 2;
        element.y = canvas.height / 2;
        break;
      case 'center-right':
        element.x = canvas.width - textWidth / 2;
        element.y = canvas.height / 2;
        break;
      case 'bottom-left':
        element.x = textWidth / 2;
        element.y = canvas.height - textHeight / 2;
        break;
      case 'bottom-center':
        element.x = canvas.width / 2;
        element.y = canvas.height - textHeight / 2;
        break;
      case 'bottom-right':
        element.x = canvas.width - textWidth / 2;
        element.y = canvas.height - textHeight / 2;
        break;
    }

    drawCanvas();
    console.log('Текстовый элемент позиционирован:', position);
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  initCanvas();

  // Обработчики событий для кнопок
  document.getElementById('addTextButton')?.addEventListener('click', addText);
  document.getElementById('deleteTextButton')?.addEventListener('click', deleteText);
  document.getElementById('saveImageButton')?.addEventListener('click', saveImage);

  // Обработчики для изменения цвета и размера текста
  document.getElementById('textColor')?.addEventListener('input', () => {
    if (selectedTextIndex !== -1) {
      textElements[selectedTextIndex].color = document.getElementById('textColor').value;
      drawCanvas();
      console.log('Цвет текста изменен:', textElements[selectedTextIndex].color);
    }
  });

  document.getElementById('textSize')?.addEventListener('input', () => {
    if (selectedTextIndex !== -1) {
      textElements[selectedTextIndex].size = parseInt(document.getElementById('textSize').value);
      drawCanvas();
      console.log('Размер текста изменен:', textElements[selectedTextIndex].size);
    }
  });

  // Инициализация слайдера качества
  qualitySlider = document.getElementById('qualitySlider');
  if (qualitySlider) {
    noUiSlider.create(qualitySlider, {
      start: [80],
      range: { min: 0, max: 100 },
      step: 1,
    });

    qualitySlider.noUiSlider.on('update', (values) => {
      document.getElementById('qualityValue').textContent = values[0];
      console.log('Качество изображения изменено:', values[0]);
    });
  }

  // Обработчик загрузки изображения
  document.getElementById('uploadForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const file = document.getElementById('imageUpload').files[0];
    if (!file) {
      alert('Пожалуйста, выберите файл.');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.src = event.target.result;
      img.onload = function () {
        // Устанавливаем фиксированную ширину canvas и пропорциональную высоту
        const aspectRatio = img.height / img.width;
        canvas.width = 800; // Фиксированная ширина
        canvas.height = canvas.width * aspectRatio; // Пропорциональная высота

        // Масштабируем изображение под размер canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        backgroundImage = img;
        drawCanvas();
        document.getElementById('editor').style.display = 'block';
        console.log('Изображение загружено:', img.src);
      };
      img.onerror = function () {
        alert('Ошибка загрузки изображения.');
      };
    };
    reader.readAsDataURL(file);
  });

  // Регистрация Service Worker (только в production-режиме)
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('ServiceWorker зарегистрирован:', registration);
      })
      .catch((error) => {
        console.log('Ошибка регистрации ServiceWorker:', error);
      });
  }

  // Обработчики для кнопок позиционирования
  const positions = [
    'top-left', 'top-center', 'top-right',
    'center-left', 'center', 'center-right',
    'bottom-left', 'bottom-center', 'bottom-right',
  ];
  positions.forEach((position) => {
    document.getElementById(`position-${position}`)?.addEventListener('click', () => {
      positionText(position);
    });
  });
});

// Инициализация canvas
function initCanvas() {
  canvas = document.getElementById('canvas');
  if (!canvas) return;

  ctx = canvas.getContext('2d');
  canvas.width = 800;
  canvas.height = 600;

  // Обработчики событий для мыши
  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseup', handleMouseUp);
}

// Обработка начала касания/нажатия
function handleMouseDown(event) {
  event.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  // Проверяем, попал ли клик в область текста
  textElements.forEach((element, index) => {
    const textWidth = ctx.measureText(element.text).width;
    const textHeight = element.size;

    if (
      mouseX >= element.x - textWidth / 2 &&
      mouseX <= element.x + textWidth / 2 &&
      mouseY >= element.y - textHeight / 2 &&
      mouseY <= element.y + textHeight / 2
    ) {
      selectedTextIndex = index;
      isDragging = true;
      dragOffsetX = mouseX - element.x;
      dragOffsetY = mouseY - element.y;
      console.log('Текстовый элемент выбран:', element.text);
    }
  });

  // Снимаем выделение, если клик был вне текста
  if (selectedTextIndex === -1) {
    isDragging = false;
    console.log('Клик вне текстового элемента. Выделение снято.');
  }

  drawCanvas();
}

// Обработка перемещения мыши/касания
function handleMouseMove(event) {
  if (isDragging && selectedTextIndex !== -1) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Перемещаем текст с учетом смещения
    textElements[selectedTextIndex].x = mouseX - dragOffsetX;
    textElements[selectedTextIndex].y = mouseY - dragOffsetY;

    // Ограничиваем перемещение в пределах canvas
    const textWidth = ctx.measureText(textElements[selectedTextIndex].text).width;
    const textHeight = textElements[selectedTextIndex].size;
    textElements[selectedTextIndex].x = Math.max(textWidth / 2, Math.min(textElements[selectedTextIndex].x, canvas.width - textWidth / 2));
    textElements[selectedTextIndex].y = Math.max(textHeight / 2, Math.min(textElements[selectedTextIndex].y, canvas.height - textHeight / 2));

    console.log('Текстовый элемент перемещен:', { x: textElements[selectedTextIndex].x, y: textElements[selectedTextIndex].y });
    drawCanvas();
  }
}

// Обработка окончания касания/нажатия
function handleMouseUp() {
  isDragging = false;
  console.log('Перемещение текста завершено.');
}

// Отрисовка canvas
function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (backgroundImage) {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  }

  textElements.forEach((element, index) => {
    ctx.font = `${element.size}px Arial`;
    ctx.fillStyle = element.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(element.text, element.x, element.y);

    // Выделение рамкой (только для активного элемента)
    if (index === selectedTextIndex) {
      const textWidth = ctx.measureText(element.text).width;
      const textHeight = element.size;
      ctx.strokeStyle = 'red';
      ctx.strokeRect(element.x - textWidth / 2, element.y - textHeight / 2, textWidth, textHeight);
    }
  });
}
