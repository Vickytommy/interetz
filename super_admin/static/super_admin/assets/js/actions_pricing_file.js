$(document).ready(function(){
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", $("[name=csrfmiddlewaretoken]").val());
            }
        }
    });
    var pricing_table =  $('#pricing_table').DataTable({
        dom: 'Bfrtip',
            buttons: [
            // {
            //     extend: 'excelHtml5',
            //     text: window.page.export_excel,
            // }
        ],
        ajax: {
            url: $("#link_to_view_").val(),
            dataSrc: 'data'
        },
        language: {
            search: 'Search'
        },
        columns: [
            { data: 'group', className:'text-center border border-gray-300 dark:border-zink-50' },
            { data: 'price_two_side', className:'text-center border border-gray-300 dark:border-zink-50' },
            { data: 'price_one_side', className:'text-center border border-gray-300 dark:border-zink-50'},
            // {
            //     data: 'image',
            //     render: function(data, type, row) {
            //         if (data) {
            //             return `<img src="${data}" alt="${row.colorknob_barcode}" class="w-6 aspect-[1/1] object-cover"/>`;
            //         }
            //         return ''; // Return empty string if no image exists
            //     },
            //     className: 'text-center border border-gray-300 dark:border-zink-50',
            // },
            {
                // New column for buttons
                data: null,
                render: function(data, type, row) {
                    

                    return `<button class="text-white transition-all duration-300 ease-linear bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600 hover:text-white active:bg-green-600 active:border-green-600 active:text-white focus:bg-green-600 focus:border-green-600 focus:text-white focus:ring focus:ring-green-500/30 btn edit_record" data-id="${row.pricing_id}" tilte="Edit Info">עדכן</button>

                        <button class="text-white transition-all duration-300 ease-linear bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600 hover:text-white active:bg-red-600 active:border-red-600 active:text-white focus:bg-red-600 focus:border-red-600 focus:text-white focus:ring focus:ring-red-500/30 btn remove_record"  data-id="${row.pricing_id}" id="id_${row.pricing_id}"><i class="fa fa-trash"></i></button>`;
                },  className:'text-center border border-gray-300 dark:border-zink-50'
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
            
        }
    });
        
    var pricing_set_table = $('#pricing_set_table').DataTable({
        dom: 'Bfrtip',
        buttons: [],
        ajax: {
            url: $("#link_to_view_").val(),
            dataSrc: function(json) {
                return json.data.slice(0, 1); // Only return the first data entry
            }
        },
        language: {
            search: ''
        },
        paging: false, // Disable pagination
        columns: [
            { 
                data: 'group',
                render: function(data, type, row) {
                    return `<td>שמירת רצף</td>`;
                },
                className: 'text-center border border-gray-300 dark:border-zink-50' 
            },
            { 
                data: 'value',
                render: function(data, type, row) {
                    return `<form id="edit_set_pricing_form" class="{% url 'super_admin:add_pricing_value' %}" method="POST" >
                                <input type="hidden" name="action" id="action" value="edit">
                                <input type="hidden" name="csrfmiddlewaretoken" value="{{ csrf_token }}">
                                <input type="hidden" name="pricing_id" id="pricing_id" value="${row.id}">
                                <input type="number" class="border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" value=${row.value} id="value_edit" name="value" placeholder='0' required>
                            </form>`;
                },
                className: 'text-center border border-gray-300 dark:border-zink-50' 
            },
            // { data: 'value', className: 'text-center border border-gray-300 dark:border-zink-50' },
            {
                // New column for buttons
                data: null,
                render: function(data, type, row) {
                    return `<button class="text-white transition-all duration-300 ease-linear bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600 hover:text-white active:bg-green-600 active:border-green-600 active:text-white focus:bg-green-600 focus:border-green-600 focus:text-white focus:ring focus:ring-green-500/30 btn change_price" data-id="${row.pricing_id}" title="Edit Info">עדכן</button>
                            <button class="text-white transition-all duration-300 ease-linear bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600 hover:text-white active:bg-red-600 active:border-red-600 active:text-white focus:bg-red-600 focus:border-red-600 focus:text-white focus:ring focus:ring-red-500/30 btn remove_price" data-id="${row.pricing_id}" id="id_${row.pricing_id}"><i class="fa fa-trash"></i></button>`;
                },
                className: 'text-center border border-gray-300 dark:border-zink-50'
            }
        ],
        language: {
            "sEmptyTable": " ",
            "sInfo": "",
            "sInfoEmpty": "",
            "sInfoFiltered": "",
            "sInfoPostFix": "",
            "sInfoThousands": ",",
            "sLengthMenu": "",
            "sLoadingRecords": "",
            "sProcessing": "",
            "sZeroRecords": "",
            oPaginate: {
                "sFirst": window.page.sFirst,
                "sLast": window.page.sLast,
                "sNext": window.page.sNext,
                "sPrevious": window.page.sPrevious,
            }
        },
        searching: false // Disable the search bar
    });
    
    $('#pricing_set_table tbody').on('click', '.change_price', function(e) {
        var rowData = pricing_set_table.row($(this).closest('tr')).data();
        console.log(rowData);
        var data = {
            value: Number($("#value_edit").val()),
            pricing_id: rowData.pricing_id,
        };
        
        $.ajax({
            url: "add_pricing_value",
            dataType: 'JSON',
            method: 'POST',
            data: data,
            success: function(data) {
                if (data.success == 1){
                    $("#edit_set_pricing_form")[0].reset();
                    $("#info_selector_2").empty().append(`<div class="px-5 py-3 text-green-800 bg-green-100 border border-green-200 rounded-md dark:text-green-200 dark:bg-green-500/20 dark:border-green-500/20">${data.msg}</div>`);
                    pricing_table.ajax.reload();
                    pricing_set_table.ajax.reload();

                }else{
                    $("#info_selector_2").empty().append(`<div class="px-5 py-3 text-red-800 bg-red-100 border border-red-200 rounded-md dark:border-red-500/20 dark:text-red-200 dark:bg-red-500/20" role="alert" id="error">${data.msg}</div>`);
                }
                
                setTimeout(() => {
                    $("#info_selector_2").empty();
                    // $("#edit_set_pricing_form").hide();
                    
                }, 5000);
            },
            error:function(data) {
                console.log(data);
            }
        }); 
    });

    $(document).on('submit','#edit_set_pricing_form',function(e){
        e.preventDefault();
        var formData = new FormData(this);
        $.ajax({
            url: $(this).attr('class'),
            dataType:'JSON',
            method:'POST',
            data:formData,
            processData: false,
            contentType: false, 
           
            success:function(data){
                    if (data.success == 1){
                        $("#edit_set_pricing_form")[0].reset();
                        $("#info_selector_2").empty().append(`<div class="px-5 py-3 text-green-800 bg-green-100 border border-green-200 rounded-md dark:text-green-200 dark:bg-green-500/20 dark:border-green-500/20">${data.msg}</div>`);
                        pricing_table.ajax.reload();
                        pricing_set_table.ajax.reload();

                    }else{
                        $("#info_selector_2").empty().append(`<div class="px-5 py-3 text-red-800 bg-red-100 border border-red-200 rounded-md dark:border-red-500/20 dark:text-red-200 dark:bg-red-500/20" role="alert" id="error">${data.msg}</div>`);
                    }
                    
                    setTimeout(() => {
                        $("#info_selector_2").empty();
                        $("#edit_set_pricing_form").hide();
                        
                    }, 5000);
            },
            error:function(data) {
                console.log(data);
            }
        }); 
    });

    $(document).on('change','#entry_type_select',function(){
        let type = $(this).find(':selected').val();
        $('#edit_form_pricing').hide();

        if(type=="single"){
            $('.single_entry_type').show();
            $('.bulk_entry_type').hide();

            $("#group").attr('required',true);
            $("#price_two_side").attr('required',true);
            $("#price_one_side").attr('required',true);
            $("#upload_pricing").attr('required',false);
            $("#upload_pricing").val('');
             $("#form_btn").show();
        }else if (type=="bulk"){
            $('.single_entry_type').hide();
            $('.bulk_entry_type').show();

             $("#group").attr('required',false);
            $("#price_two_side").attr('required',false);
             $("#price_one_side").attr('required',false);
            $("#upload_pricing").attr('required',true);
             $("#form_btn").show();

        }else{
            $('.single_entry_type').hide();
            $('.bulk_entry_type').hide();
            
            $("#form_btn").hide();
        }
    });

    $(document).on('change','#upload_pricing',function(event){

                const selectedFile = event.target.files[0];
                const fileName = selectedFile.name.toLowerCase();
                if (fileName.endsWith('.csv')) {
                    console.log('Valid CSV file selected:', fileName);
                    // Handle the file or perform further actions
                } else {
                    Swal.fire({
                            position: 'center',
                            icon: 'danger',
                            title:  window.page.csv_error_msg,
                            showConfirmButton: false,
                            timer: 1500
                    });
                    // Clear the file input
                    $('#upload_pricing').val('');
                }
        
    });

    $(document).on('submit','#add_pricing_form',function(e){
        e.preventDefault();

        // let form_data = $(this).serialize()+"&add_pricing=1";
        var formData = new FormData(this);
        //formData.append('csvFile', $('#upload_pricing')[0].files[0]);
        // console.log(formData);
        $.ajax({
            url: $(this).attr('class'),
            dataType:'JSON',
            method:'POST',
            data:formData,
            processData: false, // Prevent jQuery from processing data
            contentType: false, // Prev
            success:function(data){
                    if (data.success == 1){
                        $("#add_pricing_form")[0].reset();
                        $("#info_selector").empty().append(`<div class="px-5 py-3 text-green-800 bg-green-100 border border-green-200 rounded-md dark:text-green-200 dark:bg-green-500/20 dark:border-green-500/20">${data.msg}</div>`);
                        pricing_table.ajax.reload();
                        pricing_set_table.ajax.reload();
                        $("#entry_type_select").val('').trigger('change');
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
                            url: $("#add_pricing_form").attr('class'),
                            dataType:'JSON',
                            method:'POST',
                            data:{
                                action:"delete",
                                pricing_id:id_
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
                                        pricing_table.ajax.reload();
                                        pricing_set_table.ajax.reload();

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

    $('#pricing_table tbody').on('click', '.edit_record', function(e) {
        // Get data from the clicked row
        //$("#custom_modal").show('modal');
        var rowData = pricing_table.row($(this).closest('tr')).data();
        // console.log(rowData);
        $("#group_edit").val(rowData.group);
        $("#price_two_side_edit").val(rowData.price_two_side);
         $("#price_one_side_edit").val(rowData.price_one_side);
         $("#pricing_id").val(rowData.pricing_id);
         
        $("#entry_type_select").val('').trigger('change');
        $("#edit_form_pricing").show();
    });


    $(document).on('submit','#edit_pricing_form',function(e){
        e.preventDefault();
        var formData = new FormData(this);
        $.ajax({
            url: $(this).attr('class'),
            dataType:'JSON',
            method:'POST',
            data:formData,
            processData: false,
            contentType: false, 
           
            success:function(data){
                    if (data.success == 1){
                        $("#edit_pricing_form")[0].reset();
                        $("#info_selector_2").empty().append(`<div class="px-5 py-3 text-green-800 bg-green-100 border border-green-200 rounded-md dark:text-green-200 dark:bg-green-500/20 dark:border-green-500/20">${data.msg}</div>`);
                        pricing_table.ajax.reload();
                        pricing_set_table.ajax.reload();

                    }else{
                        $("#info_selector_2").empty().append(`<div class="px-5 py-3 text-red-800 bg-red-100 border border-red-200 rounded-md dark:border-red-500/20 dark:text-red-200 dark:bg-red-500/20" role="alert" id="error">${data.msg}</div>`);
                    }
                    
                    setTimeout(() => {
                        $("#info_selector_2").empty();
                        $("#edit_form_pricing").hide();
                        
                    }, 5000);
            },
            error:function(data) {
                console.log(data);
            }
        }); 
    });



}); //end ready here