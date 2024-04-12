# Generated by Django 4.2.5 on 2024-04-10 12:29

from django.conf import settings
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='FavoriteColors',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('CH1_L', models.CharField(choices=[('green', 'Green'), ('red', 'Red'), ('gray', 'Gray'), ('olive', 'Olive'), ('cyan', 'Cyan'), ('orange', 'Orange'), ('maroon', 'Maroon'), ('blue', 'Blue'), ('purple', 'Purple'), ('black', 'Black')], default='green', max_length=10)),
                ('CH2_L', models.CharField(choices=[('green', 'Green'), ('red', 'Red'), ('gray', 'Gray'), ('olive', 'Olive'), ('cyan', 'Cyan'), ('orange', 'Orange'), ('maroon', 'Maroon'), ('blue', 'Blue'), ('purple', 'Purple'), ('black', 'Black')], default='red', max_length=10)),
                ('CH3_L', models.CharField(choices=[('green', 'Green'), ('red', 'Red'), ('gray', 'Gray'), ('olive', 'Olive'), ('cyan', 'Cyan'), ('orange', 'Orange'), ('maroon', 'Maroon'), ('blue', 'Blue'), ('purple', 'Purple'), ('black', 'Black')], default='gray', max_length=10)),
                ('CH4_L', models.CharField(choices=[('green', 'Green'), ('red', 'Red'), ('gray', 'Gray'), ('olive', 'Olive'), ('cyan', 'Cyan'), ('orange', 'Orange'), ('maroon', 'Maroon'), ('blue', 'Blue'), ('purple', 'Purple'), ('black', 'Black')], default='olive', max_length=10)),
                ('CH5_L', models.CharField(choices=[('green', 'Green'), ('red', 'Red'), ('gray', 'Gray'), ('olive', 'Olive'), ('cyan', 'Cyan'), ('orange', 'Orange'), ('maroon', 'Maroon'), ('blue', 'Blue'), ('purple', 'Purple'), ('black', 'Black')], default='cyan', max_length=10)),
                ('CH6_L', models.CharField(choices=[('green', 'Green'), ('red', 'Red'), ('gray', 'Gray'), ('olive', 'Olive'), ('cyan', 'Cyan'), ('orange', 'Orange'), ('maroon', 'Maroon'), ('blue', 'Blue'), ('purple', 'Purple'), ('black', 'Black')], default='orange', max_length=10)),
                ('CH7_L', models.CharField(choices=[('green', 'Green'), ('red', 'Red'), ('gray', 'Gray'), ('olive', 'Olive'), ('cyan', 'Cyan'), ('orange', 'Orange'), ('maroon', 'Maroon'), ('blue', 'Blue'), ('purple', 'Purple'), ('black', 'Black')], default='maroon', max_length=10)),
                ('CH8_L', models.CharField(choices=[('green', 'Green'), ('red', 'Red'), ('gray', 'Gray'), ('olive', 'Olive'), ('cyan', 'Cyan'), ('orange', 'Orange'), ('maroon', 'Maroon'), ('blue', 'Blue'), ('purple', 'Purple'), ('black', 'Black')], default='blue', max_length=10)),
                ('CH9_L', models.CharField(choices=[('green', 'Green'), ('red', 'Red'), ('gray', 'Gray'), ('olive', 'Olive'), ('cyan', 'Cyan'), ('orange', 'Orange'), ('maroon', 'Maroon'), ('blue', 'Blue'), ('purple', 'Purple'), ('black', 'Black')], default='purple', max_length=10)),
                ('CH10_L', models.CharField(choices=[('green', 'Green'), ('red', 'Red'), ('gray', 'Gray'), ('olive', 'Olive'), ('cyan', 'Cyan'), ('orange', 'Orange'), ('maroon', 'Maroon'), ('blue', 'Blue'), ('purple', 'Purple'), ('black', 'Black')], default='black', max_length=10)),
                ('CH1_D', models.CharField(choices=[('lime', 'Lime'), ('red', 'Red'), ('cyan', 'Cyan'), ('yellow', 'Yellow'), ('green', 'Green'), ('orange', 'Orange'), ('pink', 'Pink'), ('blue', 'Blue'), ('fuchsia', 'Fuchsia'), ('white', 'White')], default='lime', max_length=10)),
                ('CH2_D', models.CharField(choices=[('lime', 'Lime'), ('red', 'Red'), ('cyan', 'Cyan'), ('yellow', 'Yellow'), ('green', 'Green'), ('orange', 'Orange'), ('pink', 'Pink'), ('blue', 'Blue'), ('fuchsia', 'Fuchsia'), ('white', 'White')], default='red', max_length=10)),
                ('CH3_D', models.CharField(choices=[('lime', 'Lime'), ('red', 'Red'), ('cyan', 'Cyan'), ('yellow', 'Yellow'), ('green', 'Green'), ('orange', 'Orange'), ('pink', 'Pink'), ('blue', 'Blue'), ('fuchsia', 'Fuchsia'), ('white', 'White')], default='cyan', max_length=10)),
                ('CH4_D', models.CharField(choices=[('lime', 'Lime'), ('red', 'Red'), ('cyan', 'Cyan'), ('yellow', 'Yellow'), ('green', 'Green'), ('orange', 'Orange'), ('pink', 'Pink'), ('blue', 'Blue'), ('fuchsia', 'Fuchsia'), ('white', 'White')], default='yellow', max_length=10)),
                ('CH5_D', models.CharField(choices=[('lime', 'Lime'), ('red', 'Red'), ('cyan', 'Cyan'), ('yellow', 'Yellow'), ('green', 'Green'), ('orange', 'Orange'), ('pink', 'Pink'), ('blue', 'Blue'), ('fuchsia', 'Fuchsia'), ('white', 'White')], default='green', max_length=10)),
                ('CH6_D', models.CharField(choices=[('lime', 'Lime'), ('red', 'Red'), ('cyan', 'Cyan'), ('yellow', 'Yellow'), ('green', 'Green'), ('orange', 'Orange'), ('pink', 'Pink'), ('blue', 'Blue'), ('fuchsia', 'Fuchsia'), ('white', 'White')], default='orange', max_length=10)),
                ('CH7_D', models.CharField(choices=[('lime', 'Lime'), ('red', 'Red'), ('cyan', 'Cyan'), ('yellow', 'Yellow'), ('green', 'Green'), ('orange', 'Orange'), ('pink', 'Pink'), ('blue', 'Blue'), ('fuchsia', 'Fuchsia'), ('white', 'White')], default='pink', max_length=10)),
                ('CH8_D', models.CharField(choices=[('lime', 'Lime'), ('red', 'Red'), ('cyan', 'Cyan'), ('yellow', 'Yellow'), ('green', 'Green'), ('orange', 'Orange'), ('pink', 'Pink'), ('blue', 'Blue'), ('fuchsia', 'Fuchsia'), ('white', 'White')], default='blue', max_length=10)),
                ('CH9_D', models.CharField(choices=[('lime', 'Lime'), ('red', 'Red'), ('cyan', 'Cyan'), ('yellow', 'Yellow'), ('green', 'Green'), ('orange', 'Orange'), ('pink', 'Pink'), ('blue', 'Blue'), ('fuchsia', 'Fuchsia'), ('white', 'White')], default='fuchsia', max_length=10)),
                ('CH10_D', models.CharField(choices=[('lime', 'Lime'), ('red', 'Red'), ('cyan', 'Cyan'), ('yellow', 'Yellow'), ('green', 'Green'), ('orange', 'Orange'), ('pink', 'Pink'), ('blue', 'Blue'), ('fuchsia', 'Fuchsia'), ('white', 'White')], default='white', max_length=10)),
                ('Math_signal_L', models.CharField(choices=[('green', 'Green'), ('red', 'Red'), ('gray', 'Gray'), ('olive', 'Olive'), ('cyan', 'Cyan'), ('orange', 'Orange'), ('maroon', 'Maroon'), ('blue', 'Blue'), ('purple', 'Purple'), ('black', 'Black')], default='gray', max_length=10)),
                ('Math_signal_D', models.CharField(choices=[('lime', 'Lime'), ('red', 'Red'), ('cyan', 'Cyan'), ('yellow', 'Yellow'), ('green', 'Green'), ('orange', 'Orange'), ('pink', 'Pink'), ('blue', 'Blue'), ('fuchsia', 'Fuchsia'), ('white', 'White')], default='gray', max_length=10)),
                ('Grid_opacity', models.FloatField(default=0.5, validators=[django.core.validators.MinValueValidator(0.0), django.core.validators.MaxValueValidator(1.0)])),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]