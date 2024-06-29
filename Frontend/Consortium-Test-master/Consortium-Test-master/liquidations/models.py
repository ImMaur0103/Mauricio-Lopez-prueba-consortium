from django.db import models
from django.contrib.auth import get_user_model


class Liquidation(models.Model):
    STATES = [
        (1, 'Activo'),
        (2, 'Anulado')
    ]
   
    created = models.DateTimeField(auto_now_add=True)
    creator = models.ForeignKey(get_user_model(), on_delete=models.PROTECT, related_name='liquidations')
    document_type_code = models.CharField(max_length=75)
    invoice_nit = models.CharField(max_length=75, default='CF')
    invoice_serie = models.CharField(max_length=50, blank=True, null=True)
    invoice_number = models.TextField()
    invoice_name = models.CharField(max_length=100)
    invoice_adress = models.CharField(max_length=150, blank=True)
    total_value =  models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField()
    document_link = models.TextField(blank=True)
    state = models.PositiveIntegerField(choices=STATES, default=1)
    is_devolution = models.BooleanField(default=False)
    elimination_reason = models.CharField(max_length=250, blank=True)

    document = models.FileField(upload_to='liquidations/', null=True, blank=True)

    def __str__(self):
        return f'{self.invoice_name} - {self.invoice_number}'