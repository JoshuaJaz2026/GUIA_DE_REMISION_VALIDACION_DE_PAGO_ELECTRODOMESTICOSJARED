from django.shortcuts import render

def home(request):
    return render(request, 'index.html')

def login_view(request):
    # Antes: return render(request, 'pages/login.html')
    # Cambia a:
    return render(request, 'login.html')