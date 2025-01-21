$(document).ready(function(){
         $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", $("[name=csrfmiddlewaretoken]").val());
                }
            }
        });
        var clap_table =    $('#clap_table').DataTable({
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
                    { data: 'manufacturer', className:'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'clap_type', className:'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'clap_code', className:'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'side_kant', className: 'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'upper_kant', className: 'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'default_side', className: 'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'default_upper', className: 'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'diameter', className: 'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'drills_amount', className: 'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'drill_1', className: 'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'drill_2', className: 'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'drill_3', className: 'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'drill_4', className: 'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'drill_5', className: 'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'drill_6', className: 'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'drill_7', className: 'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'drill_direction', className: 'text-center border border-gray-300 dark:border-zink-50' },
                    { data: 'price', className: 'text-center border border-gray-300 dark:border-zink-50' },
                    {
                        // New column for buttons
                        data: null,
                        render: function(data, type, row) {
                           

                            return `<button class="text-white transition-all duration-300 ease-linear bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600 hover:text-white active:bg-green-600 active:border-green-600 active:text-white focus:bg-green-600 focus:border-green-600 focus:text-white focus:ring focus:ring-green-500/30 btn edit_record" data-id="${row.clap_id}" tilte="Edit Info"><i class="bx bx-pencil "></i></button>

                                <button class="text-white transition-all duration-300 ease-linear bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600 hover:text-white active:bg-red-600 active:border-red-600 active:text-white focus:bg-red-600 focus:border-red-600 focus:text-white focus:ring focus:ring-red-500/30 btn remove_record"  data-id="${row.clap_id}" id="id_${row.clap_id}"><i class="fa fa-trash"></i></button>`;
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
                
    });



    $(document).on('change','#entry_type_select',function(){
        let type = $(this).find(':selected').val();

        if(type=="single"){
            $('.single_entry_type').show();
            $('.bulk_entry_type').hide();
            $("#manufacturer").attr('required',true);
            $("#clap_type").attr('required',true);
            $("#clap_code").attr('required',true);
            $("#side_kant").attr('required', true);
            $("#upper_kant").attr('required', true);
            $("#default_side").attr('required', true);
            $("#default_upper").attr('required', true);
            $("#diameter").attr('required', true);
            $("#drills_amount").attr('required', true);
            $("#drill_1").attr('required', true);
            $("#drill_2").attr('required', true);
            $("#drill_3").attr('required', true);
            $("#drill_4").attr('required', true);
            $("#drill_5").attr('required', true);
            $("#drill_6").attr('required', true);
            $("#drill_7").attr('required', true);
            $("#drill_direction").attr('required', true);
            $("#price").attr('required', true);
            $("#upload_clap").attr('required',false);
            $("#upload_clap").val('');
            
            $("#form_btn").show();
        }else if (type=="bulk") {
            $('.single_entry_type').hide();
            $('.bulk_entry_type').show();
            $("#manufacturer").attr('required',false);
             $("#clap_type").attr('required',false);
            $("#clap_code").attr('required',false);
            $("#side_kant").attr('required', false);
            $("#lower_kant").attr('required', false);
            $("#default_side").attr('required', false);
            $("#default_low").attr('required', false);
            $("#diameter").attr('required', false);
            $("#drills_amount").attr('required', false);
            $("#drill_1").attr('required', false);
            $("#drill_2").attr('required', false);
            $("#drill_3").attr('required', false);
            $("#drill_4").attr('required', false);
            $("#drill_5").attr('required', false);
            $("#drill_6").attr('required', false);
            $("#drill_7").attr('required', false);
            $("#drill_direction").attr('required', false);
            $("#price").attr('required', false);

            $("#upload_clap").attr('required',true);
            
            $("#form_btn").show();

        } else {
            $('.single_entry_type').hide();
            $('.bulk_entry_type').hide();
            $("#form_btn").hide();
        }

    });

    $(document).on('change','#upload_clap',function(event){

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
                    $('#upload_clap').val('');
                }
        
    });
    


    $(document).on('submit','#add_clap_form',function(e){
        e.preventDefault();

        var formData = new FormData(this);
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
                        $("#add_clap_form")[0].reset();
                        $("#info_selector").empty().append(`<div class="px-5 py-3 text-green-800 bg-green-100 border border-green-200 rounded-md dark:text-green-200 dark:bg-green-500/20 dark:border-green-500/20">${data.msg}</div>`);
                        clap_table.ajax.reload();
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
                            url: $("#add_clap_form").attr('class'),
                            dataType:'JSON',
                            method:'POST',
                            data:{
                                action:"delete",
                                clap_id:id_
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
                                        clap_table.ajax.reload();

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

    $('#clap_table tbody').on('click', '.edit_record', function(e) {
        // Get data from the clicked row
        //$("#custom_modal").show('modal');
        var rowData = clap_table.row($(this).closest('tr')).data();
        $("#manufacturer_edit").val(rowData.manufacturer);
        $("#clap_type_edit").val(rowData.clap_type);
        $("#clap_code_edit").val(rowData.clap_code);
        $("#side_kant_edit").val(rowData.side_kant);
        $("#upper_kant_edit").val(rowData.upper_kant);
        $("#default_side_edit").val(rowData.default_side);
        $("#default_upper_edit").val(rowData.default_upper);
        $("#diameter_edit").val(rowData.diameter);
        $("#drills_amount_edit").val(rowData.drills_amount);
        $("#drill_1_edit").val(rowData.drill_1);
        $("#drill_2_edit").val(rowData.drill_2);
        $("#drill_3_edit").val(rowData.drill_3);
        $("#drill_4_edit").val(rowData.drill_4);
        $("#drill_5_edit").val(rowData.drill_5);
        $("#drill_6_edit").val(rowData.drill_6);
        $("#drill_7_edit").val(rowData.drill_7);
        $("#drill_direction_edit").val(rowData.drill_direction);
        $("#price_edit").val(rowData.price);
        
        $("#clap_id").val(rowData.clap_id);
        $("#edit_form_clap").show();
    });






    $(document).on('submit','#edit_clap_form',function(e){
        e.preventDefault();
        var formData = $(this).serialize();
        $.ajax({
            url: $(this).attr('class'),
            dataType:'JSON',
            method:'POST',
            data:formData,
           
            success:function(data){
                    if (data.success == 1){

                        $("#edit_clap_form")[0].reset();
                        $("#info_selector_2").empty().append(`<div class="px-5 py-3 text-green-800 bg-green-100 border border-green-200 rounded-md dark:text-green-200 dark:bg-green-500/20 dark:border-green-500/20">${data.msg}</div>`);
                        clap_table.ajax.reload();
                        $("#entry_type_select").val('').trigger('change');

                    }else{
                        $("#info_selector_2").empty().append(`<div class="px-5 py-3 text-red-800 bg-red-100 border border-red-200 rounded-md dark:border-red-500/20 dark:text-red-200 dark:bg-red-500/20" role="alert" id="error">${data.msg}</div>`);
                    }
                    
                    setTimeout(() => {
                        $("#info_selector_2").empty();
                        $("#edit_form_clap").hide();
                        
                    }, 5000);
            },
            error:function(data) {
                console.log(data);
            }
        }); 
    });



}); //end ready here