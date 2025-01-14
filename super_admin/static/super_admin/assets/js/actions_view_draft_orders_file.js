$(document).ready(function(){
         $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", $("[name=csrfmiddlewaretoken]").val());
                }
            }
        });

        

        let link = $("#link_to_edit_order_").val();
        var drawer_table =    $('#reservation_table').DataTable({
                dom: 'Bfrtip',
                responsive: true,
                // responsive: false,
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
                        d.get_draft_order = '1';
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
                           
                            let button_edit = `<a href="${link}?order_id=${row.order_id}" title="${window.page.edit_text}"  class="text-white transition-all duration-300 ease-linear bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600 hover:text-white active:bg-green-600 active:border-green-600 active:text-white focus:bg-green-600 focus:border-green-600 focus:text-white focus:ring focus:ring-green-500/30 btn edit_record" data-id="${row.order_id}"><i class="bx bx-pencil" ></i></a>`;

                            //let button_view = `<a href="${link}?order_id=${row.order_id}" class="text-white transition-all duration-300 ease-linear bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600 hover:text-white active:bg-green-600 active:border-green-600 active:text-white focus:bg-green-600 focus:border-green-600 focus:text-white focus:ring focus:ring-green-500/30 btn edit_record" data-id="${row.order_id}" title="View Order Details"><i class="fa fa-eye"></i></a>`;

                            let button_delete = ` <button title="${window.page.delete_text}" class="text-white transition-all duration-300 ease-linear bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600 hover:text-white active:bg-red-600 active:border-red-600 active:text-white focus:bg-red-600 focus:border-red-600 focus:text-white focus:ring focus:ring-red-500/30 btn remove_record"  data-id="${row.order_id}" id="id_${row.order_id}"><i class="fa fa-trash"></i></button>`;

                            return button_edit + button_delete;
                        }, className:'text-center border border-gray-300 dark:border-zink-50' 
                    }
                ],
                // columnDefs: [
                //     { type: 'date', targets: [0] } // Assuming column 0 contains dates
                // ]
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

            //     columnDefs: [
            //     {
            //         targets: [0], // Assuming column 0 contains dates
            //         render: function (data, type, row) {
            //             // Parse the date using JavaScript's Date object
            //             var date = new Date(data);

            //             // Format the date as desired (e.g., "MM/DD/YYYY")
            //             var formattedDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();

            //             return formattedDate;
            //         }
            //     }
            // ]
                // initComplete: function(){

                //      var searchableColumns = Array.from(Array(9), (_, index) => index + 1); // Adjust column indices as needed
                   

                //     this.api().columns().every(function (index) {
                       
                //                 let column = this;
                //                 let title = column.header().textContent;
                //                 let input = document.createElement('input');
                //                 input.classList.add(
                //                     'w-full', 
                //                     'border', 
                //                     'py-2', 
                //                     'px-3', 
                //                     'text-13', 
                //                     'rounded', 
                //                     'border-gray-400', 
                //                     'placeholder:text-13', 
                //                     'focus:border', 
                //                     'focus:border-gray-400', 
                //                     'focus:ring-0', 
                //                     'focus:outline-none', 
                //                     'text-gray-700', 
                //                     'dark:bg-transparent', 
                //                     'placeholder:text-gray-600', 
                //                     'dark:border-zink-50', 
                //                 );

                //                 input.setAttribute('placeholder', title);
                //                 column.header().replaceChildren(input);

                //                 // Event listener for user input
                //                 input.addEventListener('keyup', () => {
                //                     if (column.search() !== input.value) {
                //                         column.search(input.value).draw();
                //                     }
                //                 });
                     
                //     });  //end search feature here
                    
                //     this.api().columns.adjust();
                // },


    });


    let link_to_delete = $("#link_to_delete_").val();
    $(document).on('click','.remove_record',function(){
        let id_ = $(this).data('id');
        Swal.fire({
                title: window.page.sure_msg,
                text:  window.page.revert_msg,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: window.page.delete_msg,
                cancelButtonText: window.page.no_cancel, 
                confirmButtonClass: 'btn btn-success mt-2',
                cancelButtonClass: 'btn btn-danger ms-2 mt-2',
                buttonsStyling: true
            }).then(function (result) {
                if (result.value) {

                         $.ajax({
                            url:link_to_delete,
                            dataType:'JSON',
                            method:'POST',
                            data:{
                                draft_order_id:id_
                            },
                            success:function(data){
                                    if (data.success == 1){
                                        
                                        Swal.fire({
                                            position: 'center',
                                            icon: 'success',
                                            title:window.page.deleted,
                                            text: data.msg,
                                            showConfirmButton: false,
                                        
                                        });
                                        drawer_table.ajax.reload();

                                    }else{
                                        Swal.fire({
                                            position: 'center',
                                            icon: 'warning',
                                            title:window.page.error,
                                            text: data.msg,
                                            showConfirmButton: false,
                                           
                                        });
                                    }
                                  
                            },
                             error:function(data) {
                                console.log(data);
                            }
                        });  //end ajax here


                }else if (
                    // Read more about handling dismissals
                    result.dismiss === Swal.DismissReason.cancel
                  ) {
                    Swal.fire({
                     title: window.page.cancelled,
                      text: window.page.action_msg,
                      icon: 'error',
                      showConfirmButton: false,
                    })
                  }
            });

    });

}); //end ready here