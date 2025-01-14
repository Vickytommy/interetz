$(document).ready(function(){
         $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", $("[name=csrfmiddlewaretoken]").val());
                }
            }
        });
        

        let create_door_order_page_link = $("#create_door_order_page_link").val();
        let create_formica_order_page_link = $("#create_formica_order_page_link").val();
        let create_plates_order_page_link = $("#create_plates_order_page_link").val();

        let link = $("#link_to_view_order_").val();
        var drawer_table =    $('#reservation_table').DataTable({
                dom: 'Bfrtip',
                responsive: true,
                // responsive: false,
                language: {
                    search: 'Search'
                },
                scrollX: true,
                autoWidth: true,
                 buttons: [
                    {
                        extend: 'excelHtml5',
                        text: window.page.export_excel,
                    }
                ],
                ajax: {
                    url: $("#link_to_view_").val(),
                    data: function(d) {
                        d.get_data = '1';
                        // You can add more parameters as needed
                    },
                    dataSrc: 'data'
                },
                columns: [
                    
                    { data: 'formatted_created_at', className:'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'formatted_updated_at', className:'text-center border border-gray-300 dark:border-zink-50' },

                    { data: 'order_id', className:'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'order_status', className:'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'type_of_reservation', className:'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'product_type', className:'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'past_order_id', className:'text-center border border-gray-300 dark:border-zink-50' },
                      { data: 'company_name', className:'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'employee_name', className:'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'client_order_id', className:'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'client_order_name', className:'text-center border border-gray-300 dark:border-zink-50' },
                    {
                        // New column for buttons
                        data: null,
                        render: function(data, type, row) {
                           
                            // let button_edit = `<button class="text-white transition-all duration-300 ease-linear bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600 hover:text-white active:bg-green-600 active:border-green-600 active:text-white focus:bg-green-600 focus:border-green-600 focus:text-white focus:ring focus:ring-green-500/30 btn edit_record" data-id="${row.order_id}" title="Edit Info"><i class="bx bx-pencil "></i></button>`;
                            // if (row.order_status == 'complete')
                            let button_view = `<a href="${link}?order_id=${row.order_id}" class="text-white transition-all duration-300 ease-linear bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600 hover:text-white active:bg-green-600 active:border-green-600 active:text-white focus:bg-green-600 focus:border-green-600 focus:text-white focus:ring focus:ring-green-500/30 btn edit_record" data-id="${row.order_id}" title="View Order Details"><i class="fa fa-eye"></i></a>`;
                            let button_order_creation = '';


                            if (row.order_status == window.page.complete){ // for complete orders
                                let target_link = "";
                                if (row.product_type == window.page.door){
                                    target_link = create_door_order_page_link;
                                }
                                else if (row.product_type == window.page.formica){
                                    target_link = create_formica_order_page_link;
                                }else if (row.product_type == window.page.plates){
                                    target_link = create_plates_order_page_link;
                                }
                            
                                button_order_creation = `<a href="${target_link}?order_id=${row.order_id}" class="mr-2 text-white transition-all duration-300 ease-linear bg-dark-500 border-dark-500 hover:bg-dark-600 hover:border-dark-600 hover:text-white active:bg-dark-600 active:border-dark-600 active:text-white focus:bg-dark-600 focus:border-dark-600 focus:text-white focus:ring focus:ring-dark-500/30 btn"  data-id="${row.order_id}" id="id_${row.order_id}"><i class="fa fa-plus"></i></a>`;
                            }
                            // console.log(button_order_creation);

                            return button_view+button_order_creation;
                        }, className:'text-center border border-gray-300 dark:border-zink-50'
                    }
                ],
                columnDefs: [{"targets":1, "type":"date-eu"}],
                order: [1, 'desc'],
                // order: [[0, "desc"]],
                initComplete: function(){
                    this.api().columns.adjust();
                },

               language: {
            "sEmptyTable":     " ",
            "sInfo":           "",
            "sInfoEmpty":      "",
            "sInfoFiltered":   "",
            "sInfoPostFix":    "",
            "sInfoThousands":  ",",
            "sLengthMenu":     "",
            "sLoadingRecords": "",
            "sProcessing":     "",
            "sSearch": window.page.search,
            "sZeroRecords":    "",
            oPaginate: {
                    "sFirst":    window.page.sFirst,
                    "sLast":    window.page.sLast,
                    "sNext":     window.page.sNext,
                    "sPrevious": window.page.sPrevious,
            }
            
        },
    });



   
    

}); //end ready here