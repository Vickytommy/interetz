from django.urls import path,include
from . import views

app_name = 'super_admin'
urlpatterns = [

    path("home", views.home, name="home"),
    path("loginSuperAdmin", views.loginSuperAdmin, name="loginSuperAdmin"),
    path("addSuperAdmin", views.addSuperAdmin, name="addSuperAdmin"),
    path('editSuperAdmin/edit/<int:super_admin_id>/', views.editSuperAdmin, name='editSuperAdmin'),
    # will use in ajax
    path("getSuperAdmininfo",  views.getSuperAdmininfo, name="getSuperAdmininfo"),
    path("deleteSuperAdmin", views.deleteSuperAdmin, name="deleteSuperAdmin"),

    path("viewSuperAdmin", views.viewSuperAdmin, name = "viewSuperAdmin"),
    path("viewSuperAdminProfile",views.viewSuperAdminProfile, name = "viewSuperAdminProfile"),
    path("changePassword",views.changePassword, name = "changePassword"),
    path("SuperAdminLogout",views.SuperAdminLogout, name = "SuperAdminLogout"),
    
    path("addAdmin",views.addAdmin, name = "addAdmin"),
    path("viewAllAdmins",views.viewAllAdmins, name = "viewAllAdmins"),
    path('editAdmin/edit/<int:admin_id>/', views.editAdmin, name='editAdmin'),
    path("changeRole", views.changeRole, name="changeRole"), # only super admin can do this, only admin can be moved to client and vice versa
    # for inventory
    path("add_collection",views.add_collection, name = "add_collection"),
    path("all_collection",views.all_collection, name = "all_collection"),
    
    path("add_knobs",views.add_knobs, name = "add_knobs"),
    path("all_knobs",views.all_knobs, name = "all_knobs"),
    path("add_knob_color",views.add_knob_color, name = "add_knob_color"),
    path("all_knob_colors",views.all_knob_colors, name = "all_knob_colors"),
    path("add_pricing",views.add_pricing, name = "add_pricing"),
    path("all_pricing",views.all_pricing, name = "all_pricing"),
    path("add_pricing_value",views.add_pricing_value, name = "add_pricing_value"),


    path("add_claps",views.add_claps, name = "add_claps"),
    path("all_clap_data",views.all_clap_data, name = "all_clap_data"),
    path("add_hinges",views.add_hinges, name = "add_hinges"),
    path("all_hinge_data",views.all_hinge_data, name = "all_hinge_data"),
    path("add_drawars",views.add_drawars, name = "add_drawars"),
    path("all_drawer_data",views.all_drawer_data, name = "all_drawer_data"),
    # path("insert_drawars",views.insert_drawars, name = "insert_drawars"),
    # path("viewSuperAdminInventory", views.viewSuperAdminInventory, name = "viewSuperAdminInventory"),
    #path("generate_pdf", views.generate_pdf, name="generate_pdf"),
    # for orders
    path("viewSuperAdminOrders", views.viewSuperAdminOrders, name = "viewSuperAdminOrders"),
    path("viewOrderDetails",views.viewOrderDetails, name="viewOrderDetails"),
    #path("viewOrderDetails",views.viewOrderDetails, name="viewOrderDetails"),
    path("editDraftOrder", views.editDraftOrder, name="editDraftOrder"),
    path("CreateDoorOrder",views.CreateDoorOrder, name="CreateDoorOrder"),
    path("CreateFormicaOrder",views.CreateFormicaOrder, name="CreateFormicaOrder"),
    # path("hebrew_menus", views.hebrew_menus, name="hebrew_menus"),
    # path("CreateKantsOrder",views.CreateKantsOrder, name="CreateKantsOrder"),
    # path("CreateDockshelfeOrder",views.CreateDockshelfeOrder, name="CreateDockshelfeOrder"),
    path("CreatePaltesOrder",views.CreatePaltesOrder, name="CreatePaltesOrder"),
    
    path("orderPageAjaxCalls",views.orderPageAjaxCalls, name="orderPageAjaxCalls"),




    # for filters on orders
    path("load_draft_orders", views.load_draft_orders, name="load_draft_orders"),
    path("delete_draft_order", views.delete_draft_order,name="delete_draft_order"),
    path("order_services_to_delievered_orders", views.order_services_to_delievered_orders, name="order_services_to_delievered_orders"),
    path("order_that_sent_to_factory", views.order_that_sent_to_factory, name="order_that_sent_to_factory"),
    path("track_order_delivers_to_clients", views.track_order_delivers_to_clients, name="track_order_delivers_to_clients"),
    

    

    # for clients
    path("addClient",views.addClient, name = "addClient"),
    path("editClient/edit/<int:client_id>/",views.editClient, name = "editClient"),
    path("viewClients", views.viewClients, name = "viewClients"),

    #for adding translations
    path("manageTranslations", views.manageTranslations, name = "manageTranslations"),
    # for csv export feature
    path("exportOrderToCsv",views.exportOrderToCsv, name = "exportOrderToCsv"),
    # for downloading order image
    path("downloadOrderImage",views.downloadOrderImage, name = "downloadOrderImage"),
    # for marking order as complete
    path("markOrderAsComplete",views.markOrderAsComplete, name = "markOrderAsComplete"),


]