
$(document).ready(function(){
    $.ajaxSetup({
       beforeSend: function(xhr, settings) {
           if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
               xhr.setRequestHeader("X-CSRFToken", $("[name=csrfmiddlewaretoken]").val());
           }
       }
   });
   var hinge_table =    $('#hinge_table').DataTable({
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
                { data: 'hinge_type', className:'text-center border border-gray-300 dark:border-zink-50' },
                { data: 'hinge_sub_type', className: 'text-center border border-gray-300 dark:border-zink-50' },
                { data: 'main_drill_diameter', className: 'text-center border border-gray-300 dark:border-zink-50' },
                { data: 'secondary_drill_diameter', className: 'text-center border border-gray-300 dark:border-zink-50' },
                { data: 'drill_depth', className: 'text-center border border-gray-300 dark:border-zink-50' },
                { data: 'lower_default', className: 'text-center border border-gray-300 dark:border-zink-50' },
                { data: 'side_default', className: 'text-center border border-gray-300 dark:border-zink-50' },
                { data: 'price', className: 'text-center border border-gray-300 dark:border-zink-50' },
                {
                   // New column for buttons
                   data: null,
                   render: function(data, type, row) {
                      

                       return `<button class="text-white transition-all duration-300 ease-linear bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600 hover:text-white active:bg-green-600 active:border-green-600 active:text-white focus:bg-green-600 focus:border-green-600 focus:text-white focus:ring focus:ring-green-500/30 btn edit_record" data-id="${row.hinge_id}" tilte="Edit Info"><i class="bx bx-pencil "></i></button>

                           <button class="text-white transition-all duration-300 ease-linear bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600 hover:text-white active:bg-red-600 active:border-red-600 active:text-white focus:bg-red-600 focus:border-red-600 focus:text-white focus:ring focus:ring-red-500/30 btn remove_record"  data-id="${row.hinge_id}" id="id_${row.hinge_id}"><i class="fa fa-trash"></i></button>`;
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
        $("#hinge_type").attr('required',true);
        $("#hinge_sub_type").attr('required', true);
        $("#main_drill_diameter").attr('required', true);
        $("#secondary_drill_diameter").attr('required', true);
        $("#drill_depth").attr('required', true);
        $("#lower_default").attr('required', true);
        $("#side_default").attr('required', true);
        $("#price").attr('required', true);
        $("#upload_hinge").attr('required',false);
        $("#upload_hinge").val('');

        $("#form_btn").show();
    }else if (type=="bulk") {
        $('.single_entry_type').hide();
        $('.bulk_entry_type').show();
        $("#manufacturer").attr('required',false);
        $("#hinge_type").attr('required',false);
        $("#hinge_sub_type").attr('required', false);
        $("#main_drill_diameter").attr('required', false);
        $("#secondary_drill_diameter").attr('required', false);
        $("#drill_depth").attr('required', false);
        $("#lower_default").attr('required', false);
        $("#side_default").attr('required', false);
        $("#price").attr('required', false);

        $("#upload_hinge").attr('required',true);
        
        $("#form_btn").show();
    } else {
        $('.single_entry_type').hide();
        $('.bulk_entry_type').hide();
        $("#form_btn").hide();
    }

});

$(document).on('change','#upload_hinge',function(event){

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
               $('#upload_hinge').val('');
           }
   
});



$(document).on('submit','#add_hinge_form',function(e){
   e.preventDefault();
   var formData = new FormData(this);
   //formData.append('csvFile', $('#upload_hinge')[0].files[0]);
//    console.log(formData);
   $.ajax({
       url: $(this).attr('class'),
       dataType:'JSON',
       method:'POST',
       data:formData,
       processData: false, // Prevent jQuery from processing data
       contentType: false, // Prev
       success:function(data){
               if (data.success == 1){
                   $("#add_hinge_form")[0].reset();
                   $("#info_selector").empty().append(`<div class="px-5 py-3 text-green-800 bg-green-100 border border-green-200 rounded-md dark:text-green-200 dark:bg-green-500/20 dark:border-green-500/20">${data.msg}</div>`);
                   hinge_table.ajax.reload();
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
                       url: $("#add_hinge_form").attr('class'),
                       dataType:'JSON',
                       method:'POST',
                       data:{
                           action:"delete",
                           hinge_id:id_
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
                                   hinge_table.ajax.reload();

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

$('#hinge_table tbody').on('click', '.edit_record', function(e) {
   // Get data from the clicked row
   //$("#custom_modal").show('modal');
   var rowData = hinge_table.row($(this).closest('tr')).data();
    $("#manufacturer_edit").val(rowData.manufacturer);
    $("#hinge_type_edit").val(rowData.hinge_type);
    $("#hinge_sub_type_edit").val(rowData.hinge_sub_type);
    $("#main_drill_diameter_edit").val(rowData.main_drill_diameter);
    $("#secondary_drill_diameter_edit").val(rowData.secondary_drill_diameter);
    $("#drill_depth_edit").val(rowData.drill_depth);
    $("#lower_default_edit").val(rowData.lower_default);
    $("#side_default_edit").val(rowData.side_default);
    $("#price_edit").val(rowData.price);
    
    $("#hinge_id").val(rowData.hinge_id);
    $("#edit_form_hinge").show();
});


$(document).on('submit','#edit_hinge_form',function(e){
   e.preventDefault();
   var formData = $(this).serialize();
   $.ajax({
       url: $(this).attr('class'),
       dataType:'JSON',
       method:'POST',
       data:formData,
      
       success:function(data){
               if (data.success == 1){

                   $("#edit_hinge_form")[0].reset();
                   $("#info_selector_2").empty().append(`<div class="px-5 py-3 text-green-800 bg-green-100 border border-green-200 rounded-md dark:text-green-200 dark:bg-green-500/20 dark:border-green-500/20">${data.msg}</div>`);
                   hinge_table.ajax.reload();
                   $("#entry_type_select").val('').trigger('change');

               }else{
                   $("#info_selector_2").empty().append(`<div class="px-5 py-3 text-red-800 bg-red-100 border border-red-200 rounded-md dark:border-red-500/20 dark:text-red-200 dark:bg-red-500/20" role="alert" id="error">${data.msg}</div>`);
               }
               
               setTimeout(() => {
                   $("#info_selector_2").empty();
                   $("#edit_form_hinge").hide();
                   
               }, 5000);
       },
       error:function(data) {
           console.log(data);
       }
   }); 
});



}); //end ready here