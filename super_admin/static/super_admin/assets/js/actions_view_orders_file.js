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
    let link_to_edit_order_ = $("#link_to_edit_order_").val();
    let link = $("#link_to_view_order_").val();
    let user_id = $("#user_id").val();
    var role_id = parseInt($("#role_id").val());

    // console.log(role_id);
    var drawer_table =    $('#reservation_table').DataTable({
           
                dom: 'Bfrtip',
                pagingType: 'full_numbers',
                // responsive: true,
                // responsive: false,
                // language: {
                //     search: window.page.search,
                // },

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
                        d.user_id = user_id;
                    },
                    dataSrc: 'data'
                },
                columns: [
                    { data: 'company_name', className:'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'employee_name', className:'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'type_of_reservation', className:'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'product_type', className:'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'order_id', className:'text-center border border-gray-300 dark:border-zink-50' },
                     { data: 'client_order_name', className:'text-center border border-gray-300 dark:border-zink-50' },
                      { data: 'client_order_id', className:'text-center border border-gray-300 dark:border-zink-50' },

                    { data: 'formatted_created_at', className:'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'formatted_updated_at', className:'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'order_status', className:'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'past_order_id', className:'text-center border border-gray-300 dark:border-zink-50' },
                    {
                     
                        data: null,
                        render: function(data, type, row) {
                            let button_edit = '';
                            let button_view = `<a href="${link}?order_id=${row.order_id}" title="${window.page.view_btn}" class="text-white transition-all duration-300 ease-linear bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600 hover:text-white active:bg-green-600 active:border-green-600 active:text-white focus:bg-green-600 focus:border-green-600 focus:text-white focus:ring focus:ring-green-500/30 btn edit_record" data-id="${row.order_id}"><i class="fa fa-eye"></i></a>`;
                            
                            let order_status_btn = '';
                            if ([1,2].includes(role_id)){ // if admin and super admin are logged in
                             
                                if (row.order_status != 'complete' ){
                                    
                                    if (row.order_status == 'draft')
                                        order_status_btn=''; 
                                    else
                                        order_status_btn = `<button class="text-white transition-all duration-300 ease-linear bg-dark-500 border-dark-500 hover:bg-dark-600 hover:border-dark-600 hover:text-white active:bg-dark-600 active:border-dark-600 active:text-white focus:bg-dark-600 focus:border-dark-600 focus:text-white focus:ring focus:ring-dark-500/30 btn change_status" title="${window.page.check_btn}" data-id="${row.order_id}"><i class="bx bx-check"></i></button>`;
                                    
                                    button_edit = `<a title="${window.page.edit_btn}" href="${link_to_edit_order_}?order_id=${row.order_id}" class="text-white transition-all duration-300 ease-linear bg-blue-500 border-blue-500 hover:bg-blue-600 hover:border-blue-600 hover:text-white active:bg-blue-600 active:border-blue-600 active:text-white focus:bg-blue-600 focus:border-blue-600 focus:text-white focus:ring focus:ring-blue-500/30 btn edit_record" data-id="${row.order_id}"><i class="bx bx-pencil "></i></a>`;
                                }

                            }

                            return button_view+" "+button_edit+" "+order_status_btn;
                        }, className:'text-center border border-gray-300 dark:border-zink-50'
                    }
            ],
            // orderCellsTop: true, 
            initComplete: function () {
                        this.api()
                        .columns([2,3,9])
                        .every(function (index) {
                            // console.log("index=",index);

                        let column = this;

                        // Create label element
                        let label = document.createElement('label');
                        label.innerText = column.header().innerText;

                        // Create select element
                        let select = document.createElement('select');
                        select.id = `${label.innerText}_filter`;
                        select.add(new Option(''));

                        // Replace header content with label
                        column.header().replaceChildren(label);

                        // Apply listener for user change in value
                        select.addEventListener('change', function () {
                            column
                                .search(select.value, { exact: true })
                                .draw();
                        });

                        // Add list of options
                        column
                            .data()
                            .unique()
                            .sort()
                            .each(function (d, j) {
                                select.add(new Option(d));
                            });

                        // Append select element to header
                        label.appendChild(select);
                    });

                         var dataTable = this.api();
                        dataTable.columns.adjust();
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

       

        
        columnDefs: [{"targets":1, "type":"date-eu"}],
        order: [9, 'desc'],
        
    });

    
    if ([1,2].includes(role_id))
        drawer_table.column(9).search(window.page.sent).draw();
     

    $(document).on('click','.change_status',function(){
        let order_id = $(this).attr('data-id');
        
        Swal.fire({
                title: window.page.sure_msg,
                text: window.page.revert_msg,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: window.page.complete_order_msg,
                cancelButtonText: window.page.no_cancel,
                confirmButtonClass: 'btn btn-success mt-2',
                cancelButtonClass: 'btn btn-danger ms-2 mt-2',
                buttonsStyling: true
            }).then(function (result) {
                if (result.value) {


                     $.ajax({
                        method:'POST',
                        url:$("#link_to_view_").val(),
                        dataType:'JSON',
                        data:{
                            order_id:order_id
                        },
                        headers: {
                            'X-CSRFToken': $("input[name='csrfmiddlewaretoken']").val(),
                        },
                        success:function(data){
                            if (data.success  == 1){
                                Swal.fire({
                                  // title: 'Success',
                                  text: data.msg,
                                  icon: 'success',
                                  confirmButtonColor: "#34c38f",
                                  showConfirmButton: false,
                                });
                                drawer_table.ajax.reload();
                            }else{
                                Swal.fire({
                                  title: window.page.error,
                                  text: data.msg,
                                  icon: 'error',
                                  confirmButtonColor: "#34c38f",
                                  showConfirmButton: false,
                                });
                            }
                            
                        },

                        error: function (data){
                            console.log(data);
                        }
                    });




                } else if (
                    // Read more about handling dismissals
                    result.dismiss === Swal.DismissReason.cancel
                  ){
                    Swal.fire({
                      title: window.page.cancelled,
                      text:window.page.action_msg,
                      icon: 'error',
                      showConfirmButton: false,
                    });
                  }
        });

    });  //end change_status here





}); //end ready here