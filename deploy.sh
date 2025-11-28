#!/bin/bash
# Script de despliegue automatizado para producción

set -e  # Salir en caso de error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuración
PROJECT_NAME="emotion-detection"
PROJECT_DIR="/var/www/$PROJECT_NAME"
BACKUP_DIR="/var/backups/$PROJECT_NAME"
LOG_FILE="/var/log/$PROJECT_NAME/deploy.log"

# Crear directorios necesarios
create_directories() {
    log "Creando directorios necesarios..."
    
    sudo mkdir -p $PROJECT_DIR
    sudo mkdir -p $BACKUP_DIR
    sudo mkdir -p /var/log/$PROJECT_NAME
    sudo mkdir -p /var/log/nginx/$PROJECT_NAME
    sudo mkdir -p /etc/nginx/sites-available
    sudo mkdir -p /etc/nginx/sites-enabled
    
    success "Directorios creados exitosamente"
}

# Instalar dependencias del sistema
install_system_dependencies() {
    log "Instalando dependencias del sistema..."
    
    # Actualizar sistema
    sudo apt-get update
    
    # Instalar dependencias
    sudo apt-get install -y \
        python3 \
        python3-pip \
        python3-venv \
        postgresql \
        postgresql-contrib \
        redis-server \
        nginx \
        certbot \
        python3-certbot-nginx \
        curl \
        git \
        build-essential \
        libpq-dev \
        libgl1-mesa-glx \
        libglib2.0-0 \
        libsm6 \
        libxext6 \
        libxrender-dev \
        libgomp1 \
        libgcc-s1
    
    success "Dependencias del sistema instaladas"
}

# Configurar PostgreSQL
setup_postgresql() {
    log "Configurando PostgreSQL..."
    
    # Crear usuario y base de datos
    sudo -u postgres psql << EOF
CREATE USER emotion_app WITH PASSWORD 'secure_password_123';
CREATE DATABASE emotion_detection_prod OWNER emotion_app;
GRANT ALL PRIVILEGES ON DATABASE emotion_detection_prod TO emotion_app;
\q
EOF
    
    # Configurar PostgreSQL para producción
    sudo -u postgres psql -d emotion_detection_prod << EOF
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
SELECT pg_reload_conf();
\q
EOF
    
    success "PostgreSQL configurado exitosamente"
}

# Configurar Redis
setup_redis() {
    log "Configurando Redis..."
    
    # Configurar Redis para producción
    sudo tee /etc/redis/redis.conf > /dev/null << EOF
# Configuración de producción para Redis
bind 127.0.0.1
port 6379
timeout 300
tcp-keepalive 60
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec
EOF
    
    sudo systemctl restart redis-server
    sudo systemctl enable redis-server
    
    success "Redis configurado exitosamente"
}

# Configurar Nginx
setup_nginx() {
    log "Configurando Nginx..."
    
    # Copiar configuración de Nginx
    sudo cp nginx.conf /etc/nginx/sites-available/$PROJECT_NAME
    
    # Crear enlace simbólico
    sudo ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
    
    # Eliminar configuración por defecto
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Verificar configuración
    sudo nginx -t
    
    # Reiniciar Nginx
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    success "Nginx configurado exitosamente"
}

# Configurar SSL con Let's Encrypt
setup_ssl() {
    log "Configurando SSL con Let's Encrypt..."
    
    # Obtener certificado SSL
    sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com --non-interactive --agree-tos --email admin@yourdomain.com
    
    # Configurar renovación automática
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
    
    success "SSL configurado exitosamente"
}

# Instalar aplicación
install_application() {
    log "Instalando aplicación..."
    
    # Crear entorno virtual
    python3 -m venv $PROJECT_DIR/venv
    source $PROJECT_DIR/venv/bin/activate
    
    # Instalar dependencias de Python
    pip install --upgrade pip
    pip install -r requirements.txt
    
    # Copiar archivos de la aplicación
    cp -r . $PROJECT_DIR/
    
    # Configurar permisos
    sudo chown -R www-data:www-data $PROJECT_DIR
    sudo chmod -R 755 $PROJECT_DIR
    
    success "Aplicación instalada exitosamente"
}

# Configurar PM2
setup_pm2() {
    log "Configurando PM2..."
    
    # Instalar PM2 globalmente
    sudo npm install -g pm2
    
    # Copiar configuración de PM2
    cp ecosystem.config.js $PROJECT_DIR/
    
    # Iniciar aplicación con PM2
    cd $PROJECT_DIR
    pm2 start ecosystem.config.js --env production
    
    # Configurar PM2 para iniciar automáticamente
    pm2 startup
    pm2 save
    
    success "PM2 configurado exitosamente"
}

# Configurar monitoreo
setup_monitoring() {
    log "Configurando monitoreo..."
    
    # Instalar Prometheus
    wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz
    tar xvfz prometheus-2.45.0.linux-amd64.tar.gz
    sudo mv prometheus-2.45.0.linux-amd64 /opt/prometheus
    sudo chown -R prometheus:prometheus /opt/prometheus
    
    # Crear usuario de Prometheus
    sudo useradd --no-create-home --shell /bin/false prometheus
    
    # Configurar servicio de Prometheus
    sudo tee /etc/systemd/system/prometheus.service > /dev/null << EOF
[Unit]
Description=Prometheus
Wants=network-online.target
After=network-online.target

[Service]
User=prometheus
Group=prometheus
Type=simple
ExecStart=/opt/prometheus/prometheus --config.file=/opt/prometheus/prometheus.yml --storage.tsdb.path=/var/lib/prometheus/ --web.console.templates=/opt/prometheus/consoles --web.console.libraries=/opt/prometheus/console_libraries --web.listen-address=0.0.0.0:9090

[Install]
WantedBy=multi-user.target
EOF
    
    sudo systemctl daemon-reload
    sudo systemctl start prometheus
    sudo systemctl enable prometheus
    
    success "Monitoreo configurado exitosamente"
}

# Configurar backup automático
setup_backup() {
    log "Configurando backup automático..."
    
    # Crear script de backup
    sudo tee /usr/local/bin/backup-emotion-detection.sh > /dev/null << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_\$DATE.tar.gz"

# Crear backup de la base de datos
pg_dump -U emotion_app -h localhost emotion_detection_prod > /tmp/db_backup.sql

# Crear backup de archivos
tar -czf \$BACKUP_FILE -C /var/www emotion-detection /tmp/db_backup.sql

# Limpiar archivos temporales
rm /tmp/db_backup.sql

# Eliminar backups antiguos (más de 30 días)
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete

echo "Backup creado: \$BACKUP_FILE"
EOF
    
    sudo chmod +x /usr/local/bin/backup-emotion-detection.sh
    
    # Configurar cron para backup diario
    echo "0 2 * * * /usr/local/bin/backup-emotion-detection.sh" | sudo crontab -
    
    success "Backup automático configurado"
}

# Configurar firewall
setup_firewall() {
    log "Configurando firewall..."
    
    # Instalar UFW si no está instalado
    sudo apt-get install -y ufw
    
    # Configurar reglas de firewall
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow ssh
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw allow 22/tcp
    
    # Habilitar firewall
    sudo ufw --force enable
    
    success "Firewall configurado exitosamente"
}

# Función principal
main() {
    log "Iniciando despliegue de $PROJECT_NAME en producción..."
    
    # Verificar que se ejecute como root o con sudo
    if [[ $EUID -ne 0 ]]; then
        error "Este script debe ejecutarse como root o con sudo"
        exit 1
    fi
    
    # Ejecutar pasos de despliegue
    create_directories
    install_system_dependencies
    setup_postgresql
    setup_redis
    setup_nginx
    setup_ssl
    install_application
    setup_pm2
    setup_monitoring
    setup_backup
    setup_firewall
    
    success "Despliegue completado exitosamente!"
    log "La aplicación está disponible en: https://yourdomain.com"
    log "Panel de monitoreo: http://yourdomain.com:9090"
    log "Logs de la aplicación: /var/log/$PROJECT_NAME/"
    log "Para ver el estado: pm2 status"
    log "Para ver logs: pm2 logs"
}

# Ejecutar función principal
main "$@"
