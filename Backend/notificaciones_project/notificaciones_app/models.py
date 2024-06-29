from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import User


class Persona(models.Model):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    cedula = models.CharField(max_length=20)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    direccion = models.CharField(max_length=255, null=True, blank=True)
    telefono = models.CharField(max_length=20, null=True, blank=True)
    email = models.EmailField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.nombre} {self.apellido}"

class Rol(models.Model):
    nombre = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre

class PersonaRol(models.Model):
    persona = models.ForeignKey(Persona, on_delete=models.CASCADE)
    rol = models.ForeignKey(Rol, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.persona} - {self.rol}"

class Entidad(models.Model):
    nombre = models.CharField(max_length=255)
    tipo = models.CharField(max_length=100, null=True, blank=True)
    direccion = models.CharField(max_length=255, null=True, blank=True)
    telefono = models.CharField(max_length=20, null=True, blank=True)
    email = models.EmailField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.nombre

class Notificacion(models.Model):
    fecha_recepcion = models.DateField()
    hora_recepcion = models.TimeField()
    entidad = models.ForeignKey(Entidad, on_delete=models.CASCADE)
    numero_cedula_expediente = models.CharField(max_length=50)
    dirigido_a = models.CharField(max_length=255)
    recepcionista = models.ForeignKey(Persona, on_delete=models.CASCADE, related_name='notificaciones_recibidas')
    hora_entrega_interna = models.TimeField(null=True, blank=True)
    colaborador_entrega = models.ForeignKey(Persona, on_delete=models.SET_NULL, null=True, blank=True, related_name='notificaciones_entregadas')
    fecha_hora_entrega = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Notificación {self.numero_cedula_expediente}"