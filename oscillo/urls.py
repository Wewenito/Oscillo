from django.urls import path
from oscillo import views

app_name = 'oscillo'
main = views.Main()


urlpatterns = [
    path('', main.oscilloSelect, name='oscilloSelect'),
    path('start/', main.index, name="start"),
    path("settings/", main.settings, name="settings"),
    path("data/", main.getData, name="data"),
    path("dataF/<int:filePosition>/<str:fileName>/", main.getFileData, name="dataF"),
    path("dataR/", main.getRawData, name="dataR"),
    path("oscilloSelect/", main.oscilloSelect, name="oscilloSelect"),
    path("setNewColors/<int:UID>/", views.SetNewColors, name="SetNewColors"),
    path("setThemePreference/<int:UID>/", views.setThemePreference, name="setThemePreference"),
    path("changePasswd/", views.changePasswd, name="changePasswd"),

    #User related patterns
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('disconnect/', views.disconnect, name='disconnect'),
    path('profile/', views.profile, name="profile"),
]


