from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('oscillo/', include('oscillo.urls')),
    path('', include('oscillo.urls')),
]
