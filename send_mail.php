<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require 'vendor/autoload.php';

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
    exit;
}

// Get JSON or Form Data
$data = json_decode(file_get_contents("php://input"), true) ?: $_POST;

$name = htmlspecialchars($data['name'] ?? '');
$email = filter_var($data['email'] ?? '', FILTER_SANITIZE_EMAIL);
$phone = htmlspecialchars($data['phone'] ?? '');
$budget = htmlspecialchars($data['budget'] ?? '');
$subject = htmlspecialchars($data['subject'] ?? '');
$project_type = htmlspecialchars($data['project_type'] ?? '');
$message = htmlspecialchars($data['message'] ?? '');

if (empty($name) || empty($email) || empty($message)) {
    echo json_encode(["status" => "error", "message" => "Please fill all required fields."]);
    exit;
}

$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'gopalharsh8586@gmail.com'; 
    $mail->Password   = getenv('SMTP_PASSWORD'); // Read securely from Railway environment variable
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = 465;

    // Recipients
    $mail->setFrom('gopalharsh8586@gmail.com', 'Portfolio Contact Form');
    $mail->addAddress('gopalharsh8586@gmail.com', 'Gopal Tiwari'); 
    $mail->addReplyTo($email, $name);

    // Content
    $mail->isHTML(true);
    $mail->Subject = 'New Contact Lead: ' . ($subject ?: 'General Inquiry');
    
    $body = "<h2>New Project Inquiry from Portfolio</h2>
            <p><strong>Name:</strong> {$name}</p>
            <p><strong>Email:</strong> {$email}</p>
            <p><strong>Phone:</strong> {$phone}</p>
            <p><strong>Project Type:</strong> {$project_type}</p>
            <p><strong>Budget:</strong> {$budget}</p>
            <p><strong>Subject:</strong> {$subject}</p>
            <br>
            <p><strong>Message:</strong></p>
            <p>" . nl2br($message) . "</p>";
            
    $mail->Body    = $body;
    $mail->AltBody = strip_tags(str_replace("<br>", "\n", $body));

    $mail->send();
    echo json_encode(["status" => "success", "message" => "Message sent successfully!"]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Message could not be sent. Error: {$mail->ErrorInfo}"]);
}
