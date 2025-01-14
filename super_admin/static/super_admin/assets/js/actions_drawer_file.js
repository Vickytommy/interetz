$(document).ready(function(){
         $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", $("[name=csrfmiddlewaretoken]").val());
                }
            }
        });
        var drawer_table =    $('#drawer_table').DataTable({
                dom: 'Bfrtip',
                 buttons: [
                    {
                        extend: 'excelHtml5',
                        text: window.page.export_excel,
                    }
                ],
                ajax: {
                    url: $("#link_to_view_").val(),
                    dataSrc: 'data'
                },
                language: {
                    search: 'Search'
                },
                columns: [
                    
                    { data: 'drawer_type', className:'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'drawer_code', className:'text-center border border-gray-300 dark:border-zink-50' },
                    {
                        // New column for buttons
                        data: null,
                        render: function(data, type, row) {
                           

                            return `<button class="text-white transition-all duration-300 ease-linear bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600 hover:text-white active:bg-green-600 active:border-green-600 active:text-white focus:bg-green-600 focus:border-green-600 focus:text-white focus:ring focus:ring-green-500/30 btn edit_record" data-id="${row.drawer_id}" tilte="Edit Info"><i class="bx bx-pencil "></i></button>

                                <button class="text-white transition-all duration-300 ease-linear bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600 hover:text-white active:bg-red-600 active:border-red-600 active:text-white focus:bg-red-600 focus:border-red-600 focus:text-white focus:ring focus:ring-red-500/30 btn remove_record"  data-id="${row.drawer_id}" id="id_${row.drawer_id}"><i class="fa fa-trash"></i></button>`;
                        }, className:'text-center border border-gray-300 dark:border-zink-50'
                    }
                ],
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
                // initComplete: function(){

                //     var searchableColumns = Array.from(Array(9), (_, index) => index + 1); // Adjust column indices as needed
                   

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



    $(document).on('change','#entry_type_select',function(){
        let type = $(this).find(':selected').val();

        if(type=="single"){
            $('.single_entry_type').show();
            $('.bulk_entry_type').hide();
            $("#drawers_type").attr('required',true);
            $("#drawers_code").attr('required',true);
            $("#upload_drawer").attr('required',false);
            $("#upload_drawer").val('');
        }else{
            $('.single_entry_type').hide();
            $('.bulk_entry_type').show();
             $("#drawers_type").attr('required',false);
            $("#drawers_code").attr('required',false);
            $("#upload_drawer").attr('required',true);

        }
        $("#form_btn").show();

    });

    $(document).on('change','#upload_drawer',function(event){

                const selectedFile = event.target.files[0];
                const fileName = selectedFile.name.toLowerCase();
                if (fileName.endsWith('.csv')) {
                    console.log('Valid CSV file selected:', fileName);
                    // Handle the file or perform further actions
                } else {
                     Swal.fire({
                            position: 'center',
                            icon: 'danger',
                            title: window.page.csv_error_msg,
                            showConfirmButton: false,
                            timer: 1500
                    });
                    // Clear the file input
                    $('#upload_drawer').val('');
                }
        
    });
    


    $(document).on('submit','#add_drawer_form',function(e){
        e.preventDefault();

        // let form_data = $(this).serialize()+"&add_drawer=1";
        var formData = new FormData(this);
        //formData.append('csvFile', $('#upload_drawer')[0].files[0]);
        console.log(formData);
        $.ajax({
            url: $(this).attr('class'),
            dataType:'JSON',
            method:'POST',
            data:formData,
            processData: false, // Prevent jQuery from processing data
            contentType: false, // Prev
            success:function(data){
                    if (data.success == 1){
                        $("#add_drawer_form")[0].reset();
                        $("#info_selector").empty().append(`<div class="px-5 py-3 text-green-800 bg-green-100 border border-green-200 rounded-md dark:text-green-200 dark:bg-green-500/20 dark:border-green-500/20">${data.msg}</div>`);
                        drawer_table.ajax.reload();

                    }else{
                        $("#info_selector").empty().append(`<div class="px-5 py-3 text-red-800 bg-red-100 border border-red-200 rounded-md dark:border-red-500/20 dark:text-red-200 dark:bg-red-500/20" role="alert" id="error">${data.msg}</div>`);
                    }
                    
                    setTimeout(() => {
                        $("#info_selector").empty();
                        
                    }, 5000);
            },
            error:function(data) {
                console.log(data);
            }
        }); 
    });

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
                            url: $("#add_drawer_form").attr('class'),
                            dataType:'JSON',
                            method:'POST',
                            data:{
                                action:"delete",
                                drawer_id:id_
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

    $('#drawer_table tbody').on('click', '.edit_record', function(e) {
        // Get data from the clicked row
        //$("#custom_modal").show('modal');
        var rowData = drawer_table.row($(this).closest('tr')).data();
        $("#drawers_type_edit").val(rowData.drawer_type);
        $("#drawers_code_edit").val(rowData.drawer_code);
        $("#drawer_id").val(rowData.drawer_id);
        $("#edit_form_drawer").show();
    });






    $(document).on('submit','#edit_drawer_form',function(e){
        e.preventDefault();
        var formData = $(this).serialize();
        $.ajax({
            url: $(this).attr('class'),
            dataType:'JSON',
            method:'POST',
            data:formData,
           
            success:function(data){
                    if (data.success == 1){

                        $("#edit_drawer_form")[0].reset();
                        $("#info_selector_2").empty().append(`<div class="px-5 py-3 text-green-800 bg-green-100 border border-green-200 rounded-md dark:text-green-200 dark:bg-green-500/20 dark:border-green-500/20">${data.msg}</div>`);
                        drawer_table.ajax.reload();

                    }else{
                        $("#info_selector_2").empty().append(`<div class="px-5 py-3 text-red-800 bg-red-100 border border-red-200 rounded-md dark:border-red-500/20 dark:text-red-200 dark:bg-red-500/20" role="alert" id="error">${data.msg}</div>`);
                    }
                    
                    setTimeout(() => {
                        $("#info_selector_2").empty();
                        $("#edit_form_drawer").hide();
                        
                    }, 5000);
            },
            error:function(data) {
                console.log(data);
            }
        }); 
    });



}); //end ready here