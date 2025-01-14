$(document).ready(function(){
         $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", $("[name=csrfmiddlewaretoken]").val());
                }
            }
        });
        let link_to_edit_order_ = $("#link_to_edit_order_").val();
        let link_to_generate_csv_ = $("#link_to_generate_csv_").val();
        let link_to_download_image_ = $("#link_to_download_image_").val();
        
        var role_id = parseInt($("#role_id").val());
        console.log(role_id);
        let link = $("#link_to_view_order_").val();
        var drawer_table =    $('#reservation_table').DataTable({
                dom: 'Bfrtip',
                // responsive: true,
                   pagingType: 'full_numbers',
               scrollX: true,
                autoWidth: true,
                language: {
                    search: 'Search'
                },
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
                           
                            let button_edit  ='';
                            let button_csv = '';
                            let button_download = '';
                            console.log('\n\nTHE ROW - \n\n', row.order_item_uploaded_img, '\n\n')
                            if ([1,2].includes(role_id)){ // if the person is admin
                                button_edit = `<a href="${link_to_edit_order_}?order_id=${row.order_id}" class="text-white transition-all duration-300 ease-linear bg-blue-500 border-blue-500 hover:bg-blue-600 hover:border-blue-600 hover:text-white active:bg-blue-600 active:border-blue-600 active:text-white focus:bg-blue-600 focus:border-blue-600 focus:text-white focus:ring focus:ring-blue-500/30 btn edit_record" title="${window.page.edit_btn}" data-id="${row.order_id}"><i class="bx bx-pencil "></i></a>`;
                                button_csv = `<a href="${link_to_generate_csv_}?order_id=${row.order_id}" class="text-white transition-all duration-300 ease-linear bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600 hover:text-white active:bg-red-600 active:border-red-600 active:text-white focus:bg-red-600 focus:border-red-600 focus:text-white focus:ring focus:ring-red-500/30 btn generate_csv" data-id="${row.order_id}" title="${window.page.delete_btn}"><i class="bx bx-file"></i></a>`;
                                
                                if (row.order_item_uploaded_img !== "") {
                                    button_download = `<a href="${link_to_download_image_}?order_track_id=${row.order_track_id}" class="text-white transition-all duration-300 ease-linear bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600 hover:text-white active:bg-green-600 active:border-green-600 active:text-white focus:bg-green-600 focus:border-green-600 focus:text-white focus:ring focus:ring-green-500/30 btn download_image" data-id="${row.order_id}" title="${window.page.download_btn}"><i class="bx bx-download"></i></a>`;
            
                                }
                            }
                            let button_view = '';
                            if (window.page.door != row.product_type){
                                button_csv = "";
                                button_view = "";
                                
                            }else{
                                button_view = `<a href="${link}?order_id=${row.order_id}" class="text-white transition-all duration-300 ease-linear bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600 hover:text-white active:bg-green-600 active:border-green-600 active:text-white focus:bg-green-600 focus:border-green-600 focus:text-white focus:ring focus:ring-green-500/30 btn edit_record" data-id="${row.order_id}" title="${window.page.view_btn}"><i class="fa fa-eye"></i></a>`;
                            }



                            return button_view +" "+ button_edit+" "+button_csv+" "+button_download;
                        }, className:'border border-gray-300 dark:border-zink-50'
                    }
                ],
                
                 initComplete: function(){
                        this.api().columns.adjust();
                },
                columnDefs: [{"targets":1, "type":"date-eu"}],
                 order: [1, 'desc'],

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