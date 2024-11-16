from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

# Create your models here.

class FavoriteColors(models.Model):
    CHOICES_LIGHT = [
        ('green', 'Green'),
        ('red', 'Red'),
        ('gray', 'Gray'),
        ('olive', 'Olive'),
        ('cyan', 'Cyan'),
        ('orange', 'Orange'),
        ('maroon', 'Maroon'),
        ('blue', 'Blue'),
        ('purple', 'Purple'),
        ('black', 'Black'),
    ]

    CHOICES_DARK = [
        ('lime', 'Lime'),
        ('red', 'Red'),
        ('cyan', 'Cyan'),
        ('yellow', 'Yellow'),
        ('green', 'Green'),
        ('orange', 'Orange'),
        ('pink', 'Pink'),
        ('blue', 'Blue'),
        ('fuchsia', 'Fuchsia'),
        ('white', 'White'),
    ]


    user = models.OneToOneField(User, on_delete=models.CASCADE, null=False)

    CH1_L = models.CharField(max_length=10, choices=CHOICES_LIGHT, default="green", null=False)
    CH2_L = models.CharField(max_length=10, choices=CHOICES_LIGHT, default="red", null=False)
    CH3_L = models.CharField(max_length=10, choices=CHOICES_LIGHT, default="gray", null=False)
    CH4_L = models.CharField(max_length=10, choices=CHOICES_LIGHT, default="olive", null=False)
    CH5_L = models.CharField(max_length=10, choices=CHOICES_LIGHT, default="cyan", null=False)
    CH6_L = models.CharField(max_length=10, choices=CHOICES_LIGHT, default="orange", null=False)
    CH7_L = models.CharField(max_length=10, choices=CHOICES_LIGHT, default="maroon", null=False)
    CH8_L = models.CharField(max_length=10, choices=CHOICES_LIGHT, default="blue", null=False)
    CH9_L = models.CharField(max_length=10, choices=CHOICES_LIGHT, default="purple", null=False)
    CH10_L = models.CharField(max_length=10, choices=CHOICES_LIGHT, default="black", null=False)

    CH1_D = models.CharField(max_length=10, choices=CHOICES_DARK, default="lime", null=False)
    CH2_D = models.CharField(max_length=10, choices=CHOICES_DARK, default="red", null=False)
    CH3_D = models.CharField(max_length=10, choices=CHOICES_DARK, default="cyan", null=False)
    CH4_D = models.CharField(max_length=10, choices=CHOICES_DARK, default="yellow", null=False)
    CH5_D = models.CharField(max_length=10, choices=CHOICES_DARK, default="green", null=False)
    CH6_D = models.CharField(max_length=10, choices=CHOICES_DARK, default="orange", null=False)
    CH7_D = models.CharField(max_length=10, choices=CHOICES_DARK, default="pink", null=False)
    CH8_D = models.CharField(max_length=10, choices=CHOICES_DARK, default="blue", null=False)
    CH9_D = models.CharField(max_length=10, choices=CHOICES_DARK, default="fuchsia", null=False)
    CH10_D = models.CharField(max_length=10, choices=CHOICES_DARK, default="white", null=False)

    Theme_saved = models.CharField(max_length=6, default="dark", null=False)

    Grid_opacity = models.FloatField(default=0.5, validators=[MinValueValidator(0.0), MaxValueValidator(1.0)], null=False)

