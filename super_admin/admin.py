from django.contrib import admin

# Register your models here.
# from my_app.models import ProductType,Reservation

# admin.site.register(ProductType)
# admin.site.register(Reservation)


from super_admin.models import EliteNovaUser, Role, Drawer, ColorKnob, Knob, Collection, helperTables, DrawarOrder, ClapOrder, HingeOrder, Cards, OrderItems, OrderTrack, RelatedOrders, Translations

admin.site.register(EliteNovaUser)
admin.site.register(Role)
admin.site.register(Drawer)
admin.site.register(ColorKnob)
admin.site.register(Knob)
admin.site.register(Collection)
admin.site.register(helperTables)


admin.site.register(DrawarOrder)
admin.site.register(ClapOrder)
admin.site.register(HingeOrder)
admin.site.register(Cards)
admin.site.register(OrderItems)
admin.site.register(OrderTrack)

admin.site.register(RelatedOrders)

admin.site.register(Translations)