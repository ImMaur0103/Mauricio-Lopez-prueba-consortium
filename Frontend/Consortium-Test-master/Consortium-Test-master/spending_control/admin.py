from django.contrib import admin
from spending_control.models import Spending

class LiquidationInline(admin.TabularInline):
    model = Spending.liquidations.through
    extra = 1

@admin.register(Spending)
class SpendingAdmin(admin.ModelAdmin):
    inlines = [LiquidationInline]
    list_display = ['created_by', 'created_at', 'type', 'status', 'totals_match']
    list_filter = ['type', 'status', 'totals_match']
    search_fields = ['created_by__username', 'justification']
    readonly_fields = ['created_at']
