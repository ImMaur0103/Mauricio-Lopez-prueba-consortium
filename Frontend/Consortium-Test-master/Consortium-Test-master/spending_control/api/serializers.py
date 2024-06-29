from rest_framework import serializers

from spending_control.models import Spending

from liquidations.models import Liquidation


class SpendingSerializer(serializers.ModelSerializer):
    created_by = serializers.HiddenField(
        default=serializers.CurrentUserDefault())

    class Meta:
        model = Spending
        fields = [
            'id',
            'created_at',
            'created_by',
            'liquidations',
            'liquidation_sent',
            'account_status',
            'liquidation_certificate',
            'signed_liquidation_certificate',
            'invoice',
            'totals_match',
            'justification',
            'type',
            'status',
        ]

        read_only_fields = ('id', 'created_at', 'updated_at')

        extra_kwargs = {
            'created_by': {'required': False},
            'updated_by': {'required': False},
        }

    def validate_liquidations(self, value):
        liquidation_ids = [liquidation.id for liquidation in value]

        liquidations_in_expense = Spending.objects.filter(
            liquidations__id__in=liquidation_ids).values_list('liquidations', flat=True)

        if liquidations_in_expense.count() > 0:
            error_message = 'Los siguientes IDs, ya están asociados a una liquidación de cobro previa, por favor revisar.\n'
            liquidations_found = Liquidation.objects.filter(
                id__in=liquidations_in_expense)

            for item in liquidations_found:
                error_message += f'\nID de cheque: {item.check_instance.request_id} - Monto: {item.total_value}'

            raise serializers.ValidationError(error_message)

        return value
