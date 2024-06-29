from django_filters.filterset import FilterSet, BooleanFilter

from spending_control.models import Spending


class SpendingFilter(FilterSet):

    liquidation_sent = BooleanFilter(
        field_name='liquidation_sent', method='filter_empty_file')
    account_status = BooleanFilter(
        field_name='account_status', method='filter_empty_file')
    liquidation_certificate = BooleanFilter(
        field_name='liquidation_certificate', method='filter_empty_file')
    invoice = BooleanFilter(field_name='invoice', method='filter_empty_file')

    def filter_empty_file(self, queryset, name, value):
        return queryset.filter(**{name: ''})

    class Meta:
        model = Spending
        fields = ['liquidation_sent', 'account_status',
                  'liquidation_certificate', 'invoice']
