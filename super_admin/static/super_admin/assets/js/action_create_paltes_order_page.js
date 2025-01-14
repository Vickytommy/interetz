$(document).ready(function(){

    // jQuery('#mymodal').trigger('click');
    var cards = [];
    $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", $("[name=csrfmiddlewaretoken]").val());
                }
            }
    });
  
    

    // $("#create_order_form_step_2").hide();
    // console.log("I am")
    $(document).on('click','#create_order_form_next_btn_step_1',function(){

        $("#step").val("step_1");
        let client_order_name = $("#client_order_name").val().trim();
        let client_order_id = $("#client_order_id").val().trim();
        let order_id = $("#order_id").val().trim();
        // if (client_order_name!='' && client_order_id!=''){
        if (client_order_name!='' || client_order_id!=''){
            let request_status_step1 = $("#request_status_step1").val().trim();
            let request_status_step1_user_id = $("#request_status_step1_user_id").val().trim();
            let step  = $("#step").val().trim();
            let product_type = $("#product_type").val();
            let have_past_order = $("#have_past_order").val();
        let past_order_id = $("#past_order_id").val();
            
            $.ajax({
                url:$("#link_to_add_").val(), // add url for posting request
                method:'POST',
                data:{
                    client_order_name:client_order_name, 
                    client_order_id:client_order_id,
                    order_id:order_id,
                    request_status_step1:request_status_step1,
                    request_status_step1_user_id:request_status_step1_user_id,
                    step:$("#step").val(),
                    action:$("#action").val(),
                    product_type:product_type,
                     have_past_order:have_past_order,
                    past_order_id:past_order_id
                },
                dataType:'JSON',
                success:function(data){
                    if (data.success == 1){
                        $("#create_order_form_step_2").show();

                        // $("#create_order_form_step_1").hide();
                        $("#step").val("");
                        $("#client_order_name").attr('readonly',true);
                        $("#client_order_id").attr('readonly',true);

                        // $("#create_order_form_next_btn_step_1").attr('disabled',true);
                         $("#create_order_form_next_btn_step_1").remove();
                        // $("input[name='color_selection']").attr('disabled',false);
                          $("#next_error_div").addClass('hide_');
                          $("#send_order_data_to_draft").removeClass('hide_');
                            // Swal.fire(
                            //     {
                            //          title: window.page.step_1_details_saved_success,
                            //         text: window.page.step_1_details_msg_success,
                            //         icon: 'success',
                            //         showConfirmButton: false,
                            //         timer: 3000
                            //     }
                            // );

                            $("#create_order_form_step_3").empty().append(html_fields_generation("no", 3));
                             get_collection(handleCollectionData, 3, ["collection_barcode[]"], ["collection_barcode"]);
                              $(".use_select2").select2();
                           // get_knob_family(handleKnobFamilyData, 3, ["knob_family[]","knob_color[]"], ["knob_family","knob_color"]);
                    }else if(data.success == 0){
                         Swal.fire(
                                {
                                    title: window.page.error,
                                    text: data.msg,
                                    icon: 'warning',
                                    showConfirmButton: false,
                                    timer: 3000
                                }
                            );
                    }
                }
            }); //end ajax call here
        } // end if here
        else{
            // Swal.fire({
            //         // position: 'center',
            //         icon: 'warning',
            //         title: window.page.error,
            //          text:window.page.step_1_details_msg_warning,
            //         showConfirmButton: false,
            //         timer: 1500
            // });
            $("#next_error_div").removeClass('hide_');
        }



    }); //end create_order_form_next_btn_step_1 event here


    
    function get_collection(callback, step_number, element_names, keys){
        $.ajax({
                url:$("#link_to_grab_order_page_data_").val(), // add url for posting request
                method:'POST',
                data:{
                    data_requirement:'collection', 
                },
                dataType:'JSON',
                success:function(data){
                    callback(data, step_number, element_names, keys);
                }
        }); //end ajax call here
       
    } //end get_collection func here

    



 function handleCollectionData(collectionData, step_number, element_names, keys) {
            if (collectionData !== null) {
                $.each(keys, function(index,key){
                    // console.log(index, key);
                    let elem_name = `div#create_order_form_step_${step_number} select[name='${element_names[index]}']`;
                    // console.log(elem_name);
                    var selectElement =  $(elem_name).empty();

                     selectElement.append($('<option>', {
                            value: '',
                            text: window.page.select_a_value
                        }
                    ));

                    // console.log(selectElement);
                    if (selectElement){
                        // console.log("selectElement found",selectElement);
                            $.each(collectionData.data, function (index, item) {
                                    // console.log(item);
                                    if (item.in_stock_bool == 1 ){
                                        selectElement.append($('<option>', {
                                                value: item[key],
                                                text: item[key],
                                                'data-id':item['collection_id'],
                                                'data-flow':item['flow'],
                                                'data-back':item['back'],
                                                'data-kant':item['kant'],
                                                'data-minorder':item['min_order'],
                                                'data-collection':item['collection_name']
                                               
                                            }
                                         ));
                                    }


                        }); //end second each
                    }
                }); // end first each
            } else{
                console.log("Error at handleCollectionData func");
            }
    } //end handleCollectionData here

   


    $(document).on('change','select[name="collection_barcode[]"]', function(){

        let data_id = $(this).attr('data-id');
        let selected_collection_barcode =  $(this).val();
        // console.log("selected_collection_barcode=",selected_collection_barcode);
       
        let back =  $(this).find(":selected").data('back');
        let kant =  $(this).find(":selected").data('kant');
        
        let collectionbarcode = $(this).val();
        let collection = $(this).find(":selected").data('collection');
        let row =`<td class="p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300">
           ${collectionbarcode}
        </td>
        <td class="p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300">
            ${collection}
        </td>
        <td class="p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300">
            ${back}
        </td>
        <td class="p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300">
            ${kant}
        </td>
         `;
        $(`#collection_table_row_${data_id}`).empty().append(row);
        $(`#collection_table_${data_id}`).show();
       
        
       
              
        

    });


    // $(document).on('change','select[name="collection[]"]', function(){
        
    //     let data_id = $(this).attr('data-id');
    //     $(`.knob_div_${data_id}`).show();
    //     $(".use_select2").select2();

    //     let back =  $(this).find(":selected").data('back');
    //     let kant =  $(this).find(":selected").data('kant');
    //     let minorder =  $(this).find(":selected").data('minorder');
    //     let collectionbarcode =  $(this).find(":selected").data('collectionbarcode');
    //     let description = $(this).find(":selected").val();

    //     // console.log(kant, back, minorder, collectionbarcode, description);
    //     let row =`<td class="p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300">
    //        ${collectionbarcode}
    //     </td>
    //     <td class="p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300">
    //         ${description}
    //     </td>
    //     <td class="p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300">
    //         ${back}
    //     </td>
    //     <td class="p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300">
    //         ${kant}
    //     </td>
    //      <td class="p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300">
    //          ${minorder}
    //     </td>`;
    //     $(`#collection_table_row_${data_id}`).empty().append(row);
    //     $(`#collection_table_${data_id}`).show();
        
    // }); 
        

        
    // });

    
    function html_fields_generation(decision, target_count){
        let html_ = [`<div class="md:col-span-6">
                                                        <div>
                                                            <label for="collection_barcode" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.collection_barcode}</label>
                                                            <select  data-id="${target_count}"  class="use_select2 col-span-12 sm:col-span-10 px-3 bg-white w-full border p-2 border-gray-400 rounded placeholder:text-sm focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-zink-700 dark:border-zink-50 dark:text-zink-200"  name="collection_barcode[]" required>
                                                               
                                                                
                                                            </select>
                                                        </div>
                                                </div>

                                                <div class="md:col-span-6">
                                                       

                                                         <table id="collection_table_${target_count}" class="w-full text-sm ltr:text-left rtl:text-right text-gray-500" style="display:none;">
                                                                
                                                            <thead class="text-sm text-gray-700 dark:text-zink-200">
                                                                    <tr class="border border-gray-300 dark:border-zink-50">
                                                                         <th scope="col" class="p-3 font-semibold border-l dark:border-zink-50 border-gray-300">
                                                                            ${window.page.collection_barcode}
                                                                        </th>
                                                                        <th scope="col" class="p-3 font-semibold border-l dark:border-zink-50 border-gray-300">
                                                                            ${window.page.collection}
                                                                        </th>
                                                                        <th scope="col" class="p-3 font-semibold border-l dark:border-zink-50 border-gray-300">
                                                                            ${window.page.back}
                                                                        </th>
                                                                        <th scope="col" class="p-3 font-semibold border-l dark:border-zink-50 border-gray-300">
                                                                             ${window.page.kant}
                                                                        </th>
                                                                    </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr class="bg-white border border-gray-300 dark:border-zink-50 dark:bg-zink-700" id="collection_table_row_${target_count}">
                                                                   
                                                                </tr>
                                                                
                                                            </tbody>
                               
                                                        </table>

                                                </div>`];
       
        


        // if (decision == "yes")
            // html_.push(`<div class="md:col-span-6">
            //                                             <div>
            //                                                 <label for="knob_family" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">Knob Family</label>
            //                                                 <select class="use_select2 col-span-12 sm:col-span-10 px-3 bg-white w-full border p-2 border-gray-400 rounded placeholder:text-sm focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700  dark:bg-zink-700 dark:border-zink-50 dark:text-zink-200" data-id="${target_count}"  name="knob_family[]" required>
                                                                
                                                                
                                                                
            //                                                 </select>
            //                                             </div>
            //                                     </div>

            //                                     <div class="md:col-span-6">
            //                                             <div>
            //                                                 <label for="knob_color" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">Knob Color</label>
            //                                                 <select class="use_select2 col-span-12 sm:col-span-10 px-3 bg-white w-full border p-2 border-gray-400 rounded placeholder:text-sm focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700  dark:bg-zink-700 dark:border-zink-50 dark:text-zink-200 knob_color_selection" data-id="${parseInt(target_count) - 2}" name="knob_color[]" required>
                                                                
            //                                                 </select>
            //                                             </div>
            //                                     </div>`);

        $("#send_order_btn").removeClass('hide_');
        $("#preview_order_button").removeClass('hide_');
        $("#send_order_data_to_draft").removeClass('hide_');
        return html_.join('');
    }




    // $('input[name="color_selection"]').change(function() {
    //     var selectedValue = $("input[name='color_selection']:checked").val();
    //     // console.log(selectedValue);
    //     $("#decision").val(selectedValue);
    //     $("#create_order_form_step_3").empty().append(html_fields_generation(selectedValue, 3));
    //     $('#create_order_form_step_2').remove();
    //     if (selectedValue == "yes")  // on yes choose this div will show up
    //         $("#create_order_form_add_collection_div").show();
    //     $("#create_order_form_step_3 select.use_select2").select2();
    //     get_collection(handleCollectionData, 3, ["collection_barcode[]","collection[]"], ["collection_barcode","collection_name"]);
    //     get_knob_family(handleKnobFamilyData, 3, ["knob_family[]","knob_color[]"], ["knob_family","knob_color"]);
        
    // }); //end input[name="color_selection"] event here



    // $(document).on('click','#add_collection_btn',function(){
    //     let next_count_div = $(this).attr('data-id');
    //     // console.log(next_count_div);
        
    //     $("#step_click_counter").val(parseInt($("#step_click_counter").val()) + 1);

    //     let decision = $("#decision").val();
    //     $(`#create_order_form_step_${next_count_div}`).empty().append(html_fields_generation(decision, next_count_div));
    //     $(`#create_order_form_step_${next_count_div} select.use_select2`).select2();
    //     get_collection(handleCollectionData, next_count_div, ["collection_barcode[]","collection[]"], ["collection_barcode","collection_name"]);
    //     get_knob_family(handleKnobFamilyData, next_count_div, ["knob_family[]","knob_color[]"], ["knob_family","knob_color"]);
        
    //     $('table#order_table tbody td:first-child').removeClass('hide_');
    //     $('table#order_table thead th:first-child').removeClass('hide_');
    //     for (let i=0; i< $('table#order_table tbody tr').length;i++ )
    //         get_collection_data(populateRowData_Collection, i+1);

    //     let counter = parseInt(next_count_div)+1;

    //     $("#add_collection_btn").attr('data-id',counter);
    //     if (counter > 5)
    //         $("#create_order_form_add_collection_div").hide();
    //     // $().empty().append();
    // });






    // $(', create_order_form_step_3#knob_color').on('change', function() {
    //         // Get the selected values
    //         var knobFamilyValue = $('#knob_family').val();
    //         var knobColorValue = $('#knob_color').val();

    //         // Check if both selections are made
    //         if (knobFamilyValue !== '' && knobColorValue !== '') {
                
    //         }
    // });


    




     // this function will used for saving order as draft after some time
    function save_to_draft(){
        console.info("Inside save_to_draft() function");
        var form_data = new FormData(document.getElementById('create_order_form'));
        form_data.append('cards', JSON.stringify(cards));
        form_data.append('step','step_draft');
        console.log(form_data);
        $.ajax({
                url:$("#link_to_add_").val(), // add url for posting request
                method:'POST',
                data:form_data,
                processData: false,  
                contentType: false, 
                dataType: 'JSON',
                success:function(data){
                    console.log(data);
                }, //end success here
                error: function(data){
                    console.log(data);
                }
        }); //end ajax call here
    
    } //end save_to_draft function here


    // setInterval(function(){
    //     var isReadOnly = $("#client_order_name").prop("readonly");
    //     if (isReadOnly)
    //         save_to_draft();
    //     else
    //         console.info("Order is not saved by user, waiting for this action...");
    // }, 10000);




     $(document).on('click','#send_order_data_to_draft', function(){
        save_to_draft();
        console.log("Order data has been stored to Draft");
        Swal.fire(
                                        {
                                            title: window.page.good_job_title, 
                                            text: $("#draft_text").val(),
                                            icon: 'success',
                                            showConfirmButton: false,
                                            timer: 5000
                                        }
                                );
    });
    
    $("#create_order_form").submit(function(e){
        
        e.preventDefault();
        

        // let add_collection_btn_count = parseInt($("#add_collection_btn").data('id')) - 3;
        // let keepflow_counter = parseInt($("input[class='keepflow_counter']").length);
        // console.log("add_collection_btn_count=",add_collection_btn_count);
        // console.log("keepflow_counter=",keepflow_counter);
        // if ( add_collection_btn_count ===  keepflow_counter){

                      let link_to_redirect_ = $("#link_to_redirect_").val();
                    var form_data = new FormData(document.getElementById('create_order_form'));
                    form_data.append('cards', JSON.stringify(cards));
                    form_data.append('step','step_insert');

                    $.ajax({
                        url:$("#link_to_add_").val(), // add url for posting request
                        method:'POST',
                        data:form_data,
                        processData: false,  // Important: Don't process the data
                        contentType: false,  // Important: Don't set content type (automatically set to multipart/form-data)
                        dataType: 'JSON',
                        success:function(data){
                            
                            if (data.success == 1){
                                // $("#create_order_form")[0].reset();
                                $("#create_order_form").remove();
                                $("#form_btn").hide();
                                Swal.fire(
                                        {
                                            title: window.page.good_job_title, 
                                            text: window.page.good_job_text,
                                            icon: 'success',
                                            showConfirmButton: false,
                                            timer: 5000
                                        }
                                );

                               setTimeout(function(){
                                    
                                    location.href = link_to_redirect_;
                                },5000);

                                // console.log(data);

                            }else{
                                    // console.log(data);
                                    Swal.fire(
                                    {
                                         title:window.page.error,
                                        text: window.page.general_error_msg,
                                        icon: 'warning',
                                        showConfirmButton: false,
                                        timer: 2000
                                    }
                            );  
                            }

                        }, //end success here

                        error: function(data){
                            console.log(data);
                        }
                    }); //end ajax call here
        // }else{
        //     Swal.fire(
        //             {
        //                 title: "Error",
        //                 text: 'Some keepflow inputs are not selected yet',
        //                 icon: 'warning',
        //                 showConfirmButton: false,
        //                 timer: 2000
        //             }
        //     );
        // }




        

        // console.log(form_data);
        return false;
    });


    

}); //end ready here
