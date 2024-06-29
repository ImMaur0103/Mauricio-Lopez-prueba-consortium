from django.contrib import admin

from liquidations.models import Liquidation


@admin.register(Liquidation)
class LiquidationAdmin(admin.ModelAdmin):
    pass