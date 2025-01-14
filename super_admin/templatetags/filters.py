from django import template
from datetime import datetime
from django.conf import settings
time_zone = settings.TIME_ZONE
register = template.Library()
import pytz
@register.filter

def format_registered_date(data):    
    if data is not None:
        data = str(data)
        date = datetime.fromisoformat(data.split('T')[0])  # Extract date part and convert to datetime object
        formatted_date = "{}/{}/{}".format(date.day, date.month, date.year)
        return formatted_date
    else:
        return ""


@register.filter
def get(mapping, key):
    return mapping.get(key, '')

@register.filter
def formater_num(number):
    if number!='' and number>0:
        return "{:.2f}".format(number)
    else:
        # print("tagss",len(number))
        return ""