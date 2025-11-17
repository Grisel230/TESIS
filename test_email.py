"""Script para probar el envío de emails"""
from email_service import email_service
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configurar servicio
EMAIL_SENDER = os.environ.get('EMAIL_SENDER')
EMAIL_PASSWORD = os.environ.get('EMAIL_PASSWORD')

print(f"Email configurado: {EMAIL_SENDER}")
print(f"Password configurado: {'Sí' if EMAIL_PASSWORD else 'No'}")

email_service.configure(EMAIL_SENDER, EMAIL_PASSWORD)

# Enviar email de prueba
print("\nEnviando email de prueba...")
result = email_service.send_test_email('grisellaurean@gmail.com')

if result:
    print("✅ Email enviado correctamente!")
else:
    print("❌ Error al enviar email")
