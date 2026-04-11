import os
from pathlib import Path
import dj_database_url # Importante para Render

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-=+!ej8rpbmo&93y#61isfk%=my0%1i+d(x^d-+&_k0zsq42(on'

# SECURITY WARNING: don't run with debug turned on in production!
# Volvemos a una configuración dinámica para DEBUG
DEBUG = 'RENDER' not in os.environ

# ACTUALIZADO: Lista de hosts autorizados
ALLOWED_HOSTS = [
    'guia-de-remision-validacion-de-pago.onrender.com', 
    '.onrender.com', 
    'localhost', 
    '127.0.0.1'
]

# ==========================================
# SOLUCIÓN AL ERROR 403 (CSRF)
# ==========================================
# Le decimos al guardia de Django que confíe en las peticiones que vienen de este dominio seguro
CSRF_TRUSTED_ORIGINS = [
    'https://guia-de-remision-validacion-de-pago.onrender.com',
]

# Application definition

INSTALLED_APPS = [
    'jazzmin',  # DEBE IR PRIMERO
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # Para archivos estáticos en Render
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'], 
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'


# Database
DATABASES = {
    'default': dj_database_url.config(
        default=f'sqlite:///{BASE_DIR / "db.sqlite3"}',
        conn_max_age=600
    )
}


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',},
]


# Internationalization
LANGUAGE_CODE = 'es-pe'
TIME_ZONE = 'America/Lima'
USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ==========================================
# CONFIGURACIÓN DE RUTAS DE ACCESO (NUEVO)
# ==========================================
# Esto evita el error 404 de /accounts/login/
LOGIN_URL = '/login/'
LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = '/login/'

# ==========================================
# CONFIGURACIÓN DE JAZZMIN
# ==========================================
JAZZMIN_SETTINGS = {
    "site_title": "JAAP Logística",
    "site_header": "JAAP",
    "site_brand": "Sublimaciones JAAP",
    "welcome_sign": "Bienvenido al Sistema Logístico JAAP",
    "copyright": "Sublimaciones JAAP 2026",
    "user_avatar": None,
    "show_sidebar": True,
    "navigation_expanded": True,
    "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.Group": "fas fa-users",
    },
    "order_with_respect_to": ["auth", "core"],
}

JAZZMIN_UI_TWEAKS = {
    "theme": "darkly", 
    "dark_mode_theme": "darkly",
    "brand_colour": "navbar-dark",
    "sidebar": "sidebar-dark-primary",
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success"
    }
}