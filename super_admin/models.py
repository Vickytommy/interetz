from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth import get_user_model
from django.utils.timezone import now as timezone_now
from django.utils import timezone
from datetime import datetime
from django.conf import settings
import pytz
time_zone = settings.TIME_ZONE
datetime_now=datetime.now(pytz.timezone(time_zone))

# class ProductType(models.Model):
#     product_type_name = models.CharField(max_length=100)
#     updated_at = models.DateTimeField(auto_now=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return self.product_type_name

# class Reservation(models.Model):
#     reservation_id = models.AutoField(primary_key=True)
#     product_type = models.ForeignKey(ProductType, on_delete=models.CASCADE)
#     reservation_status = models.CharField(max_length=100)
#     type_of_reservation = models.CharField(max_length=100)
#     related_reservation = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)
#     client_order_id = models.IntegerField()
#     client_order_name = models.CharField(max_length=100)
#     company_name = models.CharField(max_length=100)
#     employ_name = models.CharField(max_length=100)
#     employ_last_name = models.CharField(max_length=100)
#     phone_number = models.CharField(max_length=20)
#     order_date = models.DateField()
#     updated_at = models.DateTimeField(auto_now=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"Reservation ID: {self.reservation_id}, Product Type: {self.product_type.product_type_name}"
    

# # class Drawer(models.Model):
  
# #     drawer_type = models.CharField(max_length=255)
# #     drawer_code = models.CharField(max_length=50, unique=True)
# #     created_at = models.DateTimeField(auto_now_add=True)
# #     updated_at = models.DateTimeField(auto_now=True)

# #     def __str__(self):
# #         return f"{self.drawer_type} - {self.drawer_code}"
    
# class KnobPosition(models.Model):
#     knob_position = models.CharField(max_length=255)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"{self.knob_position}"

    
# class Hinge(models.Model):
#     hinge_provider = models.CharField(max_length=255)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"{self.hinge_provider}"

class Role(models.Model):
    name = models.CharField(max_length=255, unique=True)
    # Add other fields as needed
    def __str__(self):
        return self.name

class EliteNovaUser(AbstractUser):
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    company_name = models.CharField(max_length=255)
    company_id = models.CharField(max_length=255)
    employee_id = models.CharField(max_length=255, default='')
    employee_name = models.CharField(max_length=255)
    employee_last_name = models.CharField(max_length=255)
    employee_email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=255)
    #password = models.CharField(max_length=255)
    plain_password = models.CharField(max_length=255, default='')
    # username = models.CharField(max_length=255, default='custom')
    active = models.BooleanField(default=True)
    registered_date = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'employee_email'
    REQUIRED_FIELDS = ['email', 'role']  # Add any other fields as needed

    def __str__(self):
        return f"{self.employee_name} {self.employee_last_name}"
    
   

class Hinge(models.Model):
    hinge_id = models.AutoField(primary_key=True)
    manufacturer = models.CharField(max_length=255)
    hinge_type = models.CharField(max_length=255)
    hinge_sub_type = models.CharField(max_length=255)
    main_drill_diameter = models.FloatField()
    secondary_drill_diameter = models.FloatField()
    drill_depth = models.FloatField()
    lower = models.TextField()
    side = models.TextField()
    price = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.hinge_type} - {self.manufacturer}"


class Clap(models.Model):
    clap_id = models.AutoField(primary_key=True)
    manufacturer = models.CharField(max_length=255)
    clap_type = models.CharField(max_length=255)
    clap_code = models.CharField(max_length=255)

    side_kant = models.TextField()  
    upper_kant = models.TextField() 
    default_side = models.TextField()  
    default_upper = models.TextField() 
    diameter = models.FloatField()
    drills_amount = models.FloatField()
    drill_1 = models.TextField()
    drill_2 = models.TextField()
    drill_3 = models.TextField()
    drill_4 = models.TextField()
    drill_5 = models.TextField()
    drill_6 = models.TextField()
    drill_7 = models.TextField()
    drill_direction = models.FloatField()
    price = models.FloatField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.clap_type} - {self.manufacturer}"
    

class Drawer(models.Model):
    drawer_id = models.AutoField(primary_key=True)
    manufacturer = models.CharField(max_length=255, default='')
    drawer_type = models.CharField(max_length=255)
    drawer_code = models.CharField(max_length=255)

    side_kant = models.TextField(default='')  
    lower_kant = models.TextField(default='') 
    default_side = models.TextField(default='')  
    default_low = models.TextField(default='') 
    diameter = models.TextField(default='')
    drills_amount = models.TextField(default='')
    drill_1 = models.TextField(default='')
    drill_2 = models.TextField(default='')
    drill_3 = models.TextField(default='')
    drill_4 = models.TextField(default='')
    drill_5 = models.TextField(default='')
    drill_6 = models.TextField(default='')
    drill_7 = models.TextField(default='')
    height = models.TextField(default='')
    price = models.TextField(default='') 

    created_at = models.DateTimeField(auto_now_add=datetime_now)
    updated_at = models.DateTimeField(auto_now=datetime_now)

    def __str__(self):
        return f"{self.drawer_type} - {self.drawer_code}"
    

class ColorKnob(models.Model):
    colorknob_id = models.AutoField(primary_key=True)
    colorknob_barcode = models.CharField(max_length=255)
    colorknob_description = models.TextField()
    
    colorknob_image = models.ImageField(upload_to='color_knob_images/', null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    colorknob_color = models.IntegerField(default=0)
    def __str__(self):
        return f"{self.colorknob_barcode} - {self.colorknob_description}"
    
class Knob(models.Model):
    knob_id = models.AutoField(primary_key=True)
    knob_family = models.TextField()
    knob_model = models.TextField()
    two_parts_knob = models.IntegerField()
    color = models.IntegerField()
    knob_size = models.FloatField()
    button_height = models.IntegerField()
    
    price = models.FloatField(default=0)
    knob_image = models.ImageField(upload_to='knob_images/', null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.knob_family} - {self.knob_model}"
    

class Collection(models.Model):
    collection_id = models.AutoField(primary_key=True)
    collection_name = models.CharField(max_length=255)
    collection_barcode = models.CharField(max_length=255)
    description = models.TextField()
    back = models.TextField()
    kant = models.TextField()
    min_order = models.FloatField()
    in_stock = models.IntegerField()
    flow = models.IntegerField()
    height = models.FloatField()
    width = models.FloatField()
    kant_code = models.TextField()
    formica = models.IntegerField()

    price_group = models.CharField(max_length=255, default='')
    price_two_side = models.CharField(max_length=255, default='')
    price_one_side = models.CharField(max_length=255, default='')
    color_type = models.CharField(max_length=255, default='')
    thick = models.CharField(max_length=255, default='')
    collection_image = models.ImageField(upload_to='collection_images/', null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.collection_name

class Pricing(models.Model):
    pricing_id = models.AutoField(primary_key=True)
    group = models.CharField(max_length=255)
    price_two_side = models.CharField(max_length=255)
    price_one_side = models.CharField(max_length=255)

class OrderTrack(models.Model):
    order_track_id = models.AutoField(primary_key=True)
    order_id = models.BigIntegerField()
    client_order_name = models.TextField()
    client_order_id =  models.TextField(max_length=100,default='')
    order_status = models.CharField(max_length=50, default='draft')
    related_reservation = models.BooleanField(default=0)
    product_type =  models.TextField(max_length=20,default='') # doors/formica/ paltes /kants/dock_shelfe
     # Add the foreign key field
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    order_decision_tracker = models.CharField(max_length=10, default='no')
    type_of_reservation = models.TextField(max_length=20, default='new')
    order_collection_entries_count = models.IntegerField(default=0)
    order_cards_rows_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    

    def __str__(self):
        return str(self.order_id)


class OrderItems(models.Model):
    order_item_id = models.AutoField(primary_key=True)
    order_item_collection_barcode = models.TextField()
    order_item_collection = models.TextField()
    order_item_keepflow = models.TextField()
    order_item_texture = models.TextField()
    order_item_uploaded_img = models.ImageField(upload_to='uploaded_images/')
    order_item_knobfamily = models.TextField()
    order_item_knobcolor = models.TextField()

    # Foreign key to the OrderTrack model
    order_track = models.ForeignKey(OrderTrack, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.order_item_collection_barcode


class RelatedOrders(models.Model):
    related_order_id = models.AutoField(primary_key=True)
    past_order = models.ForeignKey(OrderTrack, related_name='related_past_orders', on_delete=models.CASCADE)
    current_order = models.ForeignKey(OrderTrack, related_name='related_current_orders', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.past_order


class HingeOrder(models.Model):
    hinge_order_id = models.AutoField(primary_key=True)
    # Foreign key to the OrderTrack model
    order_track = models.ForeignKey(OrderTrack, on_delete=models.CASCADE)
    hinge_order_provider = models.TextField()
    hinge_order_door_opening_side = models.TextField()
    hinge_order_dty = models.TextField()
    hinge_order_yp = models.TextField()
    hinge_order_xp1 = models.TextField()
    hinge_order_xp2 = models.TextField()
    hinge_order_xp3 = models.TextField()
    hinge_order_xp4 = models.TextField()
    hinge_order_xp5 = models.TextField()
    hinge_order_xp6 = models.TextField()
    unique_identifier = models.TextField(default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"Hinge Order {self.hinge_order_id} for Order {self.order_track.order_id}"


class ClapOrder(models.Model):
    clap_order_id = models.AutoField(primary_key=True)
    # Foreign key to the OrderTrack model
    order_track = models.ForeignKey(OrderTrack, on_delete=models.CASCADE)
    clap_claps_pr = models.TextField()
    clap_order_lo = models.TextField()
    clap_order_ro = models.TextField()
    clap_order_bo = models.TextField()
    unique_identifier = models.TextField(default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"ClapOrder {self.clap_order_id} for Order {self.order_track.order_id}"

class DrawarOrder(models.Model):
    drawar_order_id = models.AutoField(primary_key=True)
    # Foreign key to the OrderTrack model
    order_track = models.ForeignKey(OrderTrack, on_delete=models.CASCADE)
    drawar_order_type = models.TextField()
    drawar_order_code = models.TextField()
    drawar_order_lo = models.TextField()
    drawar_order_ro = models.TextField()
    drawar_order_bo = models.TextField()
    
    unique_identifier = models.TextField(default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"DrawarOrder {self.drawar_order_id} for Order {self.order_track.order_id}"


class Cards(models.Model):
    card_order_id = models.AutoField(primary_key=True)
    # Foreign key to the OrderTrack model
    order_track = models.ForeignKey(OrderTrack, on_delete=models.CASCADE)
    # drawer_order = models.ForeignKey(DrawarOrder, on_delete=models.CASCADE)
    # clap_order = models.ForeignKey(ClapOrder, on_delete=models.CASCADE)
    # hinge_order = models.ForeignKey(HingeOrder, on_delete=models.CASCADE)
    have_drawer = models.BooleanField(default=False)
    have_clap = models.BooleanField(default=False)
    have_hinge = models.BooleanField(default=False)
    unique_identifier = models.TextField(default='')

    # knob = models.ForeignKey(Knob, on_delete=models.CASCADE, default=None) # for knob position id
    knob = models.TextField(default='')

    collection_barcode_id =  models.CharField(max_length=10, default='')
    card_width = models.FloatField()
    card_height = models.FloatField()
    card_quantity = models.IntegerField()
    knob_position_id =  models.TextField(default='')
    card_notes = models.TextField(default='')


    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"Order {self.order_track.order_id}"



class helperTables(models.Model):
    helper_table_id = models.AutoField(primary_key=True)
    helper_data_helper_name = models.TextField() # table name
    helper_value_english = models.TextField()
    helper_value_hebrew = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.helper_data_helper_name

class Translations(models.Model):
    translation_id = models.AutoField(primary_key=True)
    translation_page_name = models.TextField() # table name
    translation_english_verion = models.TextField()
    translation_hebrew_verion = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.translation_english_verion