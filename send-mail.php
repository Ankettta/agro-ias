<?php

$name = $_POST['name'] ?? ''; 
$email = $_POST['email'] ?? ''; 
$phone = $_POST['phone'] ?? ''; 

// 2. Проверяем, что все обязательные поля заполнены
if (empty($name) || empty($email) || empty($phone)) {
    http_response_code(400); // Ошибка: не все поля заполнены
    echo json_encode(['status' => 'error', 'message' => 'Пожалуйста, заполните все поля']);
    exit;
}

// 3. Настройки для отправки письма
$to = 'an_prokhorova86@mail.ru'; 
$subject = 'Новая заявка с сайта АгроИАС'; 
$charset = 'UTF-8';

// 4. Содержимое письма 
$message = "
  <html>
  <body>
    <h2>Новая заявка с сайта</h2>
    <p><strong>Имя:</strong> $name</p>
    <p><strong>Email:</strong> $email</p>
    <p><strong>Телефон:</strong> $phone</p>
  </body>
  </html>
";

// 5. Заголовки письма 
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=$charset\r\n";
$headers .= "From: Заявка с сайта <no-reply@agroias.ru>\r\n"; 
$headers .= "Reply-To: $email\r\n"; // Ответить будет на email пользователя

// 6. Отправляем письмо
if (mail($to, $subject, $message, $headers)) {
    // Письмо отправлено успешно
    echo json_encode(['status' => 'success', 'message' => 'Заявка отправлена']);
} else {
    // Ошибка отправки
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Не удалось отправить заявку']);
}

