"""
Servicio de envío de emails para recuperación de contraseña
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

logger = logging.getLogger(__name__)

class EmailService:
    """Servicio para enviar correos electrónicos"""
    
    def __init__(self, smtp_server='smtp.gmail.com', smtp_port=587):
        """
        Inicializa el servicio de email
        
        Args:
            smtp_server: Servidor SMTP (por defecto Gmail)
            smtp_port: Puerto SMTP (por defecto 587 para TLS)
        """
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
        self.sender_email = None
        self.sender_password = None
    
    def configure(self, sender_email, sender_password):
        """
        Configura las credenciales del remitente
        
        Args:
            sender_email: Email del remitente
            sender_password: Contraseña de aplicación del remitente
        """
        self.sender_email = sender_email
        self.sender_password = sender_password
    
    def send_password_reset_email(self, recipient_email, reset_link, recipient_name=None):
        """
        Envía un correo de recuperación de contraseña
        
        Args:
            recipient_email: Email del destinatario
            reset_link: Link de recuperación de contraseña
            recipient_name: Nombre del destinatario (opcional)
        
        Returns:
            bool: True si se envió correctamente, False si hubo error
        """
        if not self.sender_email or not self.sender_password:
            logger.error("Credenciales de email no configuradas")
            return False
        
        try:
            # Crear mensaje
            message = MIMEMultipart("alternative")
            message["Subject"] = "Recuperación de Contraseña - Sistema de Detección de Emociones"
            message["From"] = self.sender_email
            message["To"] = recipient_email
            
            # Crear contenido HTML
            name_text = recipient_name if recipient_name else "Usuario"
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 40px auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Recuperación de Contraseña</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Sistema de Detección de Emociones con IA</p>
                    </div>
                    
                    <!-- Body -->
                    <div style="padding: 40px 30px;">
                        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                            Hola <strong>{name_text}</strong>,
                        </p>
                        
                        <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
                            Recibimos una solicitud para restablecer la contraseña de tu cuenta. 
                            Si no realizaste esta solicitud, puedes ignorar este correo de forma segura.
                        </p>
                        
                        <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">
                            Para restablecer tu contraseña, haz clic en el siguiente botón:
                        </p>
                        
                        <!-- Botón -->
                        <div style="text-align: center; margin: 35px 0;">
                            <a href="{reset_link}" 
                               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                      color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; 
                                      font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                                Restablecer Contraseña
                            </a>
                        </div>
                        
                        <p style="color: #777; font-size: 13px; line-height: 1.6; margin: 30px 0 20px 0;">
                            O copia y pega este enlace en tu navegador:
                        </p>
                        
                        <div style="background-color: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; word-break: break-all;">
                            <a href="{reset_link}" style="color: #667eea; text-decoration: none; font-size: 13px;">
                                {reset_link}
                            </a>
                        </div>
                        
                        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 30px 0; border-radius: 4px;">
                            <p style="color: #856404; margin: 0; font-size: 13px; line-height: 1.6;">
                                <strong>⚠️ Importante:</strong> Este enlace expirará en <strong>1 hora</strong> por razones de seguridad.
                            </p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #6b7280; font-size: 13px; margin: 0 0 10px 0;">
                            Sistema de Detección de Emociones con IA
                        </p>
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                            Este es un correo automático, por favor no respondas a este mensaje.
                        </p>
                    </div>
                </div>
                
                <!-- Footer adicional -->
                <div style="text-align: center; padding: 20px;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                        © 2025 Sistema de Detección de Emociones. Todos los derechos reservados.
                    </p>
                </div>
            </body>
            </html>
            """
            
            # Crear versión texto plano como alternativa
            text_content = f"""
            Hola {name_text},
            
            Recibimos una solicitud para restablecer la contraseña de tu cuenta.
            
            Para restablecer tu contraseña, visita el siguiente enlace:
            {reset_link}
            
            Este enlace expirará en 1 hora por razones de seguridad.
            
            Si no realizaste esta solicitud, puedes ignorar este correo.
            
            ---
            Sistema de Detección de Emociones con IA
            """
            
            # Adjuntar partes al mensaje
            part1 = MIMEText(text_content, "plain")
            part2 = MIMEText(html_content, "html")
            message.attach(part1)
            message.attach(part2)
            
            # Enviar email
            logger.info(f"Intentando enviar email a {recipient_email}")
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()  # Habilitar seguridad TLS
                server.login(self.sender_email, self.sender_password)
                server.sendmail(self.sender_email, recipient_email, message.as_string())
            
            logger.info(f"Email enviado exitosamente a {recipient_email}")
            return True
            
        except smtplib.SMTPAuthenticationError:
            logger.error("Error de autenticación SMTP. Verifica las credenciales.")
            return False
        except smtplib.SMTPException as e:
            logger.error(f"Error SMTP al enviar email: {e}")
            return False
        except Exception as e:
            logger.error(f"Error inesperado al enviar email: {e}")
            return False
    
    def send_test_email(self, recipient_email):
        """
        Envía un email de prueba para verificar la configuración
        
        Args:
            recipient_email: Email del destinatario
        
        Returns:
            bool: True si se envió correctamente, False si hubo error
        """
        if not self.sender_email or not self.sender_password:
            logger.error("Credenciales de email no configuradas")
            return False
        
        try:
            message = MIMEText("Este es un correo de prueba del Sistema de Detección de Emociones.")
            message["Subject"] = "Test - Sistema de Detección de Emociones"
            message["From"] = self.sender_email
            message["To"] = recipient_email
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.sendmail(self.sender_email, recipient_email, message.as_string())
            
            logger.info(f"Email de prueba enviado a {recipient_email}")
            return True
            
        except Exception as e:
            logger.error(f"Error al enviar email de prueba: {e}")
            return False


# Instancia global del servicio
email_service = EmailService()
