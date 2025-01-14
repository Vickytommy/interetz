$(document).ready(function(){

    var cards = [];
    var knobs_tracker = [];
    knobs_tracker =  JSON.parse($("#knobs_tracker").text());
    console.log("knobs_tracker=",knobs_tracker);
    var keep_flow_tracker = [];
    keep_flow_tracker = JSON.parse($("#keep_flow_tracker").text());
    console.log("keep_flow_tracker=",keep_flow_tracker);
    $(`select.use_select2`).select2();
    $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", $("[name=csrfmiddlewaretoken]").val());
                }
            }
    });

    ///////// To add scroll down function /////////
    $(document).on('click','#add_row_btn', function() {
        $('html, body').scrollTop($("#send_order_btn").offset().top);
    });

     $(document).on('keydown','input[type="text"]', function(event) {
        if (event.key === "Enter" || event.keyCode === 13) {
            event.preventDefault();
            console.log("Not allowed to press the Enter Key");
            return false;

        }
    });
    
        // let inputs_table = ["input[name='width[]']", "input[name='height[]']", "input[name='quantity[]']"];

        $(document).on('keypress', function(e) {
            if (event.key === "Enter" || event.keyCode === 13) {
                e.preventDefault();
                console.log("Not allowed to press the Enter Key");
                return false;
            }
        });


        //lock the above fields
        function lock_fields(){
            $(`.keep_flow_decision_btn`).addClass('blur_field');
            $(`select[name="collection_barcode[]"]`).attr("readonly", "readonly");
            $(`select[name="knob_family[]"]`).attr("readonly", "readonly");
            $(`select[name="knob_color[]"]`).attr("readonly", "readonly");
            $(`input[type="file"]`).addClass('blur_field');
            $(`input[type="radio"]`).addClass('blur_field');
            $(`select[name="texture[]"]`).addClass('blur_field');
            $(`input[name="color_selection"]`).addClass('blur_field');
            $("#add_collection_btn").addClass('blur_field');
        }
        lock_fields();
        // //lock the fields
        // $(document).on('keyup','#height_1', function(){
        //     lock_fields();
        // });



    function countEmptyAndNonEmptyValues(arr) {
  let emptyCount = 0;
  let nonEmptyCount = 0;

  arr.forEach(item => {
    if (item === null || item === undefined || item === "" ||
        (Array.isArray(item) && item.length === 0) ||
        (typeof item === 'object' && Object.keys(item).length === 0)) {
      emptyCount++;
    } else {
      nonEmptyCount++;
    }
  });

  return {
    empty: emptyCount,
    nonEmpty: nonEmptyCount
  };
}
    function count_quantity(){
            var totalQuantity = 0;
    
            // Iterate over each input element with name "quantity[]"
            $('input[name="quantity[]"]').each(function() {
                // Convert input value to a number and add it to totalQuantity
                totalQuantity += parseInt($(this).val()) || 0;
            });

            return totalQuantity;

          //  $("#quatity_counter").html(totalQuantity);

    }



    $(document).on('keyup', '.nh_counter_field', function(){
        console.log("nh_counter_field is working");
        let data_id = $(this).attr("data-id");
        let total_xp = parseInt($(this).val());
        if ($(this).val() !== "" && total_xp <=6){

            for (let i=0; i < 6; i++ ){
                $(`#xp${i+1}_${data_id}`).val('');
                $(`.xp${i+1}_div_${data_id}`).hide();
            }
            
            for (let i=0; i < total_xp; i++ )
                $(`.xp${i+1}_div_${data_id}`).show();
        }
        
        //console.log(data_id);
        
    });

    $(document).on('keyup','input[name="quantity[]"]', function(){
        $("#quatity_counter").html(count_quantity());
    });



    function subform_generation_edit(counter, obj){
        let token = $("[name=csrfmiddlewaretoken]").val();
        let have_drawer = obj.have_drawer;
        let options = '';

        let drawer_form = `<form method="POST" class="subform_temp" id="drawer_sub_details_${counter}" style="display:none">

             <input type="hidden" name="subform_type" value="drawer">
             <input type="hidden" name="csrfmiddlewaretoken" value="${token}">

            <h6 class="text-15 font-semibold dark:text-white mb-4">${window.page.DrawerDetails}</h6>

             <div class="grid grid-cols-12 gap-x-4 md:gap-4" id="drawer_details_${counter}">
                                                                                                                        
                 <div class="md:col-span-2">
                         <div>
                             <label for="" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.DrawerType}</label>
                             <select class="col-span-12 sm:col-span-10 px-3 bg-white w-full border p-2 border-gray-400 rounded placeholder:text-sm focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700  dark:bg-zink-700 dark:border-zink-50 dark:text-zink-200" required name="drawers_type" id="drawers_type_${counter}">
                             </select>
                         </div>
                 </div>
                                                                                                                

                                                                                                                
                 <div class="md:col-span-2">
                         <div>
                             <label class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200" for="grid-first-name">
                                 ${window.page.DrawerCode}
                             </label>
                             <select class="col-span-12 sm:col-span-10 px-3 bg-white w-full border p-2 border-gray-400 rounded placeholder:text-sm focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700  dark:bg-zink-700 dark:border-zink-50 dark:text-zink-200" required name="drawers_code" id="drawers_code_${counter}">
                             </select>
                         </div>
                 </div>
                                                                                                                

                 <div class="md:col-span-2">
                     <div>
                         <label for="" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.lo}</label>
                         <input class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" required name="lo" id="lo_${counter}">
                     </div>
                 </div>

                 <div class="md:col-span-2">
                     <div>
                         <label for="" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.ro}</label>
                         <input class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" required name="ro" id="ro_${counter}">
                     </div>
                 </div>


                 <div class="md:col-span-2">
                     <div>
                         <label for="" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.bo}</label>
                         <input class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" required name="bo" id="bo_${counter}">
                     </div>
                 </div>

                 <div class="md:col-span-2  mt-7">
                     <div >
                         <button type="submit" id="drawer_submit_${counter}" name="drawer_submit_${counter}" class="text-white transition-all duration-300 ease-linear bg-blue-500 border-blue-500 hover:bg-blue-600 hover:border-blue-600 hover:text-white active:bg-blue-600 active:border-blue-600 active:text-white focus:bg-blue-600 focus:border-blue-600 focus:text-white focus:ring focus:ring-blue-500/30 btn">${window.page.submit}</button>


                          <button type="button" data-id="drills_${counter}" class="close_modal mr-2 text-white transition-all duration-300 ease-linear bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600 hover:text-white active:bg-red-600 active:border-red-600 active:text-white focus:bg-red-600 focus:border-red-600 focus:text-white focus:ring focus:ring-red-500/30 btn">${window.page.close}</button>
                       
                     </div>
                 </div>

             </div>

         </form>`;


        if (have_drawer){
            options=`<option value="drawer_sub_details_${counter}" >${window.page.drawer}</option>`;
                    ;
           drawer_form = `<form method="POST" class="subform_temp" id="drawer_sub_details_${counter}" >

                                                                                                                 <input type="hidden" name="subform_type" value="drawer">

                                                                                                                 <input type="hidden" name="csrfmiddlewaretoken" value="${token}">

                                                                                                                <h6 class="text-15 font-semibold dark:text-white mb-4">${window.page.DrawerDetails}</h6>

                                                                                                                <div class="grid grid-cols-12 gap-x-4 md:gap-4" id="drawer_details_${counter}">
                                                                                                                        
                                                                                                                            <div class="md:col-span-2">
                                                                                                                                    <div>
                                                                                                                                        <label for="" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.DrawerType}</label>
                                                                                                                                        <select class="col-span-12 sm:col-span-10 px-3 bg-white w-full border p-2 border-gray-400 rounded placeholder:text-sm focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700  dark:bg-zink-700 dark:border-zink-50 dark:text-zink-200" required name="drawers_type" id="drawers_type_${counter}">
                                                                                                                                            
                                                                                                                                        </select>
                                                                                                                                    </div>
                                                                                                                            </div>
                                                                                                                

                                                                                                                
                                                                                                                            <div class="md:col-span-2">
                                                                                                                                    <div>
                                                                                                                                        <label class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200" for="grid-first-name">
                                                                                                                                            ${window.page.DrawerCode}
                                                                                                                                        </label>
                                                                                                                                        <select class="col-span-12 sm:col-span-10 px-3 bg-white w-full border p-2 border-gray-400 rounded placeholder:text-sm focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700  dark:bg-zink-700 dark:border-zink-50 dark:text-zink-200" required name="drawers_code" id="drawers_code_${counter}">
                                                                                                                                        </select>
                                                                                                                                    </div>
                                                                                                                            </div>
                                                                                                                

                                                                                                                            <div class="md:col-span-2">
                                                                                                                                <div>
                                                                                                                                    <label for="" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.lo}</label>
                                                                                                                                    <input value=${obj.card_drawer[0].drawar_order_lo} class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" required name="lo" id="lo_${counter}">
                                                                                                                                </div>
                                                                                                                            </div>

                                                                                                                            <div class="md:col-span-2">
                                                                                                                                <div>
                                                                                                                                    <label for="" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.ro}</label>
                                                                                                                                    <input value=${obj.card_drawer[0].drawar_order_ro} class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" required name="ro" id="ro_${counter}">
                                                                                                                                </div>
                                                                                                                            </div>


                                                                                                                            <div class="md:col-span-2">
                                                                                                                                <div>
                                                                                                                                    <label for="" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.bo}</label>
                                                                                                                                    <input value=${obj.card_drawer[0].drawar_order_bo} class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" required name="bo" id="bo_${counter}">
                                                                                                                                </div>
                                                                                                                            </div>

                                                                                                                            <div class="md:col-span-2  mt-7">
                                                                                                                                <div >
                                                                                                                                    <button type="submit" id="drawer_submit_${counter}" name="drawer_submit_${counter}" class="text-white transition-all duration-300 ease-linear bg-blue-500 border-blue-500 hover:bg-blue-600 hover:border-blue-600 hover:text-white active:bg-blue-600 active:border-blue-600 active:text-white focus:bg-blue-600 focus:border-blue-600 focus:text-white focus:ring focus:ring-blue-500/30 btn">${window.page.submit}</button>


                                                                                                                                    <button type="button" data-id="drills_${counter}" class="close_modal mr-2 text-white transition-all duration-300 ease-linear bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600 hover:text-white active:bg-red-600 active:border-red-600 active:text-white focus:bg-red-600 focus:border-red-600 focus:text-white focus:ring focus:ring-red-500/30 btn">${window.page.close}</button>
                                                                                                                                   
                                                                                                                                </div>


                                                                                                                            </div>

                                                                                                                </div>

                                                                                                            </form>`;
        }
         let hinge_form = `<form method="POST" class="subform_temp" id="hinge_sub_details_${counter}" style="display:none;">
                                                                                                             <input type="hidden" name="csrfmiddlewaretoken" value="${token}">
                                                                                                                 <input type="hidden" name="subform_type" value="hinge">

                                                                                                                 <h6 class="text-15 font-semibold dark:text-white mb-4">Hinge Details</h6>
                                                                                                                 <div class="grid grid-cols-12 gap-x-4 md:gap-4 mb-4" id="hinge_details_${counter}">
                                                                                                                         
                                                                                                                          <div class="md:col-span-4">
                                                                                                                                 <div>
                                                                                                                                     <label for="hinge_provider" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.HingeProvider}</label>
                                                                                                                                     <select class="col-span-12 sm:col-span-10 px-3 bg-white w-full border p-2 border-gray-400 rounded placeholder:text-sm focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700  dark:bg-zink-700 dark:border-zink-50 dark:text-zink-200"  required name="hinge_provider" id="hinge_provider_${counter}">
                                                                                                                                     </select>
                                                                                                                                 </div>
                                                                                                                         </div>

                                                                                                                         <div class="md:col-span-4">
                                                                                                                                 <div>
                                                                                                                                     <label for="door_operning_side" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.DoorOpeningSide}</label>
                                                                                                                                     <select class="col-span-12 sm:col-span-10 px-3 bg-white w-full border p-2 border-gray-400 rounded placeholder:text-sm focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700  dark:bg-zink-700 dark:border-zink-50 dark:text-zink-200"  required name="door_operning_side" id="door_operning_side_${counter}">
                                                                                                                                       
                                                                                                                                        
                                                                                                                                        
                                                                                                                                     </select>
                                                                                                                                 </div>
                                                                                                                         </div>


                                                                                                                         <div class="md:col-span-4">
                                                                                                                            <div>
                                                                                                                                <label for="dty" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.dty}</label>
                                                                                                                                 <select class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" required name="dty" id="dty_${counter}">
                                                                                                                                 <option value="${window.page.dty_option1}">${window.page.dty_option1}</option>
                                                                                                                                 <option value="${window.page.dty_option2}">${window.page.dty_option2}</option>
                                                                                                                                 </select>
                                                                                                                             </div>
                                                                                                                         </div>

                                                                                                                         <div class="md:col-span-4 mt-4">
                                                                                                                             <div>
                                                                                                                                label for="yp" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.yp}</label>
                                                                                                                                 <input class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" required name="yp" id="yp_${counter}">
                                                                                                                             </div>
                                                                                                                         </div>

                                                                                                                         <div class="md:col-span-4 mt-4">
                                                                                                                            <div>
                                                                                                                                <label for="nh" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.nh}</label>
                                                                                                                                <input class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200 nh_counter_field" data-id="${counter}" required name="nh" type="number" min="1" max="6" id="nh_${counter}">
                                                                                                                            </div>
                                                                                                                        </div>



                                                                                                                         <div class="md:col-span-4 xp1_div_${counter} mt-4" style="display:none;">
                                                                                                                                <div>
                                                                                                                                    <label for="xp1" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.xp1}</label>
                                                                                                                                     <input class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200"  name="xp1" id="xp1_${counter}">
                                                                                                                                 </div>
                                                                                                                         </div>

                                                                                                                         <div class="md:col-span-4 xp2_div_${counter} mt-4" style="display:none;">
                                                                                                                                <div>
                                                                                                                                    <label for="xp2" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.xp2}</label>
                                                                                                                                 <input class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" required name="xp2" id="xp2_${counter}">
                                                                                                                             </div>
                                                                                                                         </div>

                                                                                                                        <div class="md:col-span-4 xp3_div_${counter} mt-4" style="display:none;">
                                                                                                                             <div>
                                                                                                                                 <label for="xp3" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.xp3}</label>
                                                                                                                                 <input class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" required name="xp3" id="xp3_${counter}">
                                                                                                                             </div>
                                                                                                                         </div>
                                                                                                                           <div class="md:col-span-4 xp4_div_${counter} mt-4" style="display:none;">
                                                                                                                            <div>
                                                                                                                                <label for="xp4" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.xp4}</label>
                                                                                                                                 <input class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" required name="xp4" id="xp4_${counter}">
                                                                                                                             </div>
                                                                                                                         </div>
                                                                                                                         <div class="md:col-span-4 xp5_div_${counter} mt-4" style="display:none;">
                                                                                                                            <div>
                                                                                                                                <label for="xp5" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.xp5}</label>
                                                                                                                                 <input class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" required name="xp5" id="xp5_${counter}">
                                                                                                                             </div>
                                                                                                                         </div>
                                                                                                                         
                                                                                                                          <div class="md:col-span-4 xp6_div_${counter} mt-4" style="display:none;">
                                                                                                                            <div>
                                                                                                                                <label for="xp6" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.xp6}</label>
                                                                                                                                 <input class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" required name="xp6" id="xp6_${counter}">
                                                                                                                             </div>
                                                                                                                         </div>


                                                                                                                         <div class="md:col-span-2 mt-10">
                                                                                                                             <div >
                                                                                                                                 <button type="submit" id="hinge_submit_${counter}" name="hinge_submit_${counter}"  class="text-white transition-all duration-300 ease-linear bg-blue-500 border-blue-500 hover:bg-blue-600 hover:border-blue-600 hover:text-white active:bg-blue-600 active:border-blue-600 active:text-white focus:bg-blue-600 focus:border-blue-600 focus:text-white focus:ring focus:ring-blue-500/30 btn">${window.page.submit}</button>

                                                                                                                                 <button type="button" data-id="drills_${counter}" class="close_modal mr-2 text-white transition-all duration-300 ease-linear bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600 hover:text-white active:bg-red-600 active:border-red-600 active:text-white focus:bg-red-600 focus:border-red-600 focus:text-white focus:ring focus:ring-red-500/30 btn">${window.page.close}</button>
                                                                                                                               
                                                                                                                             </div>
                                                                                                                         </div>

                                                                                                                 </div>
                                                                                                             </form>`;
        let have_hinge = obj.have_hinge;
        
        if (have_hinge){
            let xp_values = [obj.card_hinge[0].hinge_order_xp1, obj.card_hinge[0].hinge_order_xp2, obj.card_hinge[0].hinge_order_xp3, obj.card_hinge[0].hinge_order_xp4, obj.card_hinge[0].hinge_order_xp5, obj.card_hinge[0].hinge_order_xp6];
            let select_option = '';
            if (obj.card_hinge[0].hinge_order_dty  == window.page.dty_option1){
                select_option += `<option value="${window.page.dty_option1}" selected>${window.page.dty_option1}</option><option value="${window.page.dty_option2}">${window.page.dty_option2}</option>`;
            }else{
                select_option += `<option value="${window.page.dty_option1}" >${window.page.dty_option1}</option><option value="${window.page.dty_option2}" selected>${window.page.dty_option2}</option>`;
            }
        let empty_counter = countEmptyAndNonEmptyValues(xp_values);
            options=`<option value="hinge_sub_details_${counter}">Hinge</option>`;
            hinge_form = `<form method="POST" class="subform_temp" id="hinge_sub_details_${counter}">
                                                                                                            <input type="hidden" name="csrfmiddlewaretoken" value="${token}">
                                                                                                                <input type="hidden" name="subform_type" value="hinge">

                                                                                                                <h6 class="text-15 font-semibold dark:text-white mb-4">${window.page.HingeDetails}</h6>
                                                                                                                <div class="grid grid-cols-12 gap-x-4 md:gap-4 mb-4" id="hinge_details_${counter}">
                                                                                                                         
                                                                                                                        <div class="md:col-span-4">
                                                                                                                                <div>
                                                                                                                                    <label for="hinge_provider" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.HingeProvider}</label>
                                                                                                                                    <select class="col-span-12 sm:col-span-10 px-3 bg-white w-full border p-2 border-gray-400 rounded placeholder:text-sm focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700  dark:bg-zink-700 dark:border-zink-50 dark:text-zink-200"  required name="hinge_provider" id="hinge_provider_${counter}">
                                                                                                                                    </select>
                                                                                                                                </div>
                                                                                                                        </div>

                                                                                                                       <div class="md:col-span-4">
                                                                                                                                <div>
                                                                                                                                    <label for="door_operning_side" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.DoorOpeningSide}</label>
                                                                                                                                    <select class="col-span-12 sm:col-span-10 px-3 bg-white w-full border p-2 border-gray-400 rounded placeholder:text-sm focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700  dark:bg-zink-700 dark:border-zink-50 dark:text-zink-200"  required name="door_operning_side" id="door_operning_side_${counter}">
                                                                                                                                       
                                                                                                                                        
                                                                                                                                        
                                                                                                                                    </select>
                                                                                                                                </div>
                                                                                                                        </div>


                                                                                                                        <div class="md:col-span-4">
                                                                                                                            <div>
                                                                                                                                <label for="dty" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.dty}</label>

                                                                                                                                <select  class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" required name="dty" id="dty_${counter}">
                                                                                                                                        ${select_option}

                                                                                                                                    </select>
                                                                                                                            </div>
                                                                                                                        </div>

                                                                                                                        <div class="md:col-span-4 mt-4">
                                                                                                                            <div>
                                                                                                                                <label for="yp" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.yp}</label>
                                                                                                                                <input value="${obj.card_hinge[0].hinge_order_yp}"  class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" required name="yp" id="yp_${counter}">
                                                                                                                            </div>
                                                                                                                        </div>

                                                                                                                        <div class="md:col-span-4 mt-4">
                                                                                                                            <div>
                                                                                                                                <label for="nh" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.nh}</label>
                                                                                                                                <input class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200 nh_counter_field" data-id="${counter}" required name="nh" type="number" min="1" max="6" id="nh_${counter}" value="${empty_counter.nonEmpty}">
                                                                                                                            </div>
                                                                                                                        </div>


                                                                                                                        <div class="md:col-span-4 xp1_div_${counter} mt-4" style="display:none;">
                                                                                                                                <div>
                                                                                                                                    <label for="xp1" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.xp1}</label>
                                                                                                                                    <input value="${obj.card_hinge[0].hinge_order_xp1}"  class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200"  name="xp1" id="xp1_${counter}">
                                                                                                                                </div>
                                                                                                                        </div>

                                                                                                                        <div class="md:col-span-4 xp2_div_${counter} mt-4" style="display:none;">
                                                                                                                            <div>
                                                                                                                                <label for="xp2" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.xp2}</label>
                                                                                                                                <input value="${obj.card_hinge[0].hinge_order_xp2}"  class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" name="xp2" id="xp2_${counter}">
                                                                                                                            </div>
                                                                                                                        </div>

                                                                                                                       <div class="md:col-span-4 xp3_div_${counter} mt-4" style="display:none;">
                                                                                                                            <div>
                                                                                                                                <label for="xp3" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.xp3}</label>
                                                                                                                                <input value="${obj.card_hinge[0].hinge_order_xp3}"  class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" name="xp3" id="xp3_${counter}">
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                         <div class="md:col-span-4 xp4_div_${counter} mt-4" style="display:none;">
                                                                                                                            <div>
                                                                                                                                <label for="xp4" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.xp4}</label>
                                                                                                                                <input value="${obj.card_hinge[0].hinge_order_xp4}"  class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" name="xp4" id="xp4_${counter}">
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div class="md:col-span-4 xp5_div_${counter} mt-4" style="display:none;">
                                                                                                                            <div>
                                                                                                                                <label for="xp5" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.xp5}</label>
                                                                                                                                <input value="${obj.card_hinge[0].hinge_order_xp5}"  class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" name="xp5" id="xp5_${counter}">
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                         
                                                                                                                        <div class="md:col-span-4 xp6_div_${counter} mt-4" style="display:none;">
                                                                                                                            <div>
                                                                                                                                <label for="xp6" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.xp6}</label>
                                                                                                                                <input value="${obj.card_hinge[0].hinge_order_xp6}"  class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" name="xp6" id="xp6_${counter}">
                                                                                                                            </div>
                                                                                                                        </div>


                                                                                                                        <div class="md:col-span-2 mt-10">
                                                                                                                            <div >
                                                                                                                                <button type="submit" id="hinge_submit_${counter}" name="hinge_submit_${counter}"  class="text-white transition-all duration-300 ease-linear bg-blue-500 border-blue-500 hover:bg-blue-600 hover:border-blue-600 hover:text-white active:bg-blue-600 active:border-blue-600 active:text-white focus:bg-blue-600 focus:border-blue-600 focus:text-white focus:ring focus:ring-blue-500/30 btn">${window.page.submit}</button>

                                                                                                                                <button type="button" data-id="drills_${counter}" class="close_modal mr-2 text-white transition-all duration-300 ease-linear bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600 hover:text-white active:bg-red-600 active:border-red-600 active:text-white focus:bg-red-600 focus:border-red-600 focus:text-white focus:ring focus:ring-red-500/30 btn">${window.page.close}</button>
                                                                                                                               
                                                                                                                            </div>
                                                                                                                        </div>

                                                                                                                </div>
                                                                                                            </form>`;
        }
        let clap_form = `<form method="POST" class="subform_temp" id="claps_sub_details_${counter}" style="display:none;">
                                                                                                                 <input type="hidden" name="subform_type" value="claps">
                                                                                                                 <input type="hidden" name="csrfmiddlewaretoken" value="${token}">
                                                                                                                 <h6 class="text-15 font-semibold dark:text-white mb-4 mt-4">${window.page.ClapsDetails}</h6>
                                                                                                                 <div class="grid grid-cols-12 gap-x-4 md:gap-4 mb-4 mt-4" id="claps_${counter}_details">
                                                                                                                        
                                                                                                                             <div class="md:col-span-2">
                                                                                                                                     <div>
                                                                                                                                         <label for="clap_pr" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.ClapsPr}</label>
                                                                                                                                         <select class="col-span-12 sm:col-span-10 px-3 bg-white w-full border p-2 border-gray-400 rounded placeholder:text-sm focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700  dark:bg-zink-700 dark:border-zink-50 dark:text-zink-200" required name="clap_pr" id="clap_pr_${counter}">
                                                                                                                                         </select>
                                                                                                                                     </div>
                                                                                                                             </div>

                                                                                                                             <div class="md:col-span-2">
                                                                                                                                 <div>
                                                                                                                                     <label for="lo" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.lo}</label>
                                                                                                                                     <input class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" required name="lo" id="lo_${counter}">
                                                                                                                                 </div>
                                                                                                                             </div>

                                                                                                                             <div class="md:col-span-2">
                                                                                                                                 <div>
                                                                                                                                     <label for="ro" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.ro}</label>
                                                                                                                                     <input class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" required name="ro" id="ro_${counter}">
                                                                                                                                 </div>
                                                                                                                             </div>


                                                                                                                             <div class="md:col-span-2">
                                                                                                                                 <div>
                                                                                                                                     <label for="bo" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.bo}</label>
                                                                                                                                     <input class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" required name="bo" id="bo_${counter}">
                                                                                                                                 </div>
                                                                                                                             </div>

                                                                                                                             <div class="md:col-span-2  mt-7">
                                                                                                                                 <div >
                                                                                                                                     <button type="submit" id="claps_submit_${counter}" name="claps_submit_${counter}" class="text-white transition-all duration-300 ease-linear bg-blue-500 border-blue-500 hover:bg-blue-600 hover:border-blue-600 hover:text-white active:bg-blue-600 active:border-blue-600 active:text-white focus:bg-blue-600 focus:border-blue-600 focus:text-white focus:ring focus:ring-blue-500/30 btn">${window.page.submit}</button>

                                                                                                                                     <button type="button" data-id="drills_${counter}" class="close_modal mr-2 text-white transition-all duration-300 ease-linear bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600 hover:text-white active:bg-red-600 active:border-red-600 active:text-white focus:bg-red-600 focus:border-red-600 focus:text-white focus:ring focus:ring-red-500/30 btn">${window.page.close}</button>
                                                                                                                                   
                                                                                                                                 </div>
                                                                                                                             </div>
                                                                                                                     </div>
                                                                                                             </form>`;
        let have_clap = obj.have_clap;
        if (have_clap){
            options=`<option value="claps_sub_details_${counter}">Claps</option>`;
            clap_form = `<form method="POST" class="subform_temp" id="claps_sub_details_${counter}">
                                                                                                                <input type="hidden" name="subform_type" value="claps">
                                                                                                                <input type="hidden" name="csrfmiddlewaretoken" value="${token}">
                                                                                                                <h6 class="text-15 font-semibold dark:text-white mb-4 mt-4">${window.page.ClapsDetails}</h6>
                                                                                                                <div class="grid grid-cols-12 gap-x-4 md:gap-4 mb-4 mt-4" id="claps_${counter}_details">
                                                                                                                        
                                                                                                                            <div class="md:col-span-2">
                                                                                                                                    <div>
                                                                                                                                        <label for="clap_pr" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.ClapsPr}</label>
                                                                                                                                        <select class="col-span-12 sm:col-span-10 px-3 bg-white w-full border p-2 border-gray-400 rounded placeholder:text-sm focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700  dark:bg-zink-700 dark:border-zink-50 dark:text-zink-200" required name="clap_pr" id="clap_pr_${counter}">
                                                                                                                                        </select>
                                                                                                                                    </div>
                                                                                                                            </div>

                                                                                                                            <div class="md:col-span-2">
                                                                                                                                <div>
                                                                                                                                    <label for="lo" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.lo}</label>
                                                                                                                                    <input value="${obj.card_clap[0].clap_order_lo}" class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" required name="lo" id="lo_${counter}">
                                                                                                                                </div>
                                                                                                                            </div>

                                                                                                                            <div class="md:col-span-2">
                                                                                                                                <div>
                                                                                                                                    <label for="ro" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.ro}</label>
                                                                                                                                    <input value="${obj.card_clap[0].clap_order_ro}" class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" required name="ro" id="ro_${counter}">
                                                                                                                                </div>
                                                                                                                            </div>


                                                                                                                            <div class="md:col-span-2">
                                                                                                                                <div>
                                                                                                                                    <label for="bo" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.bo}</label>
                                                                                                                                    <input value="${obj.card_clap[0].clap_order_bo}" class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" required name="bo" id="bo_${counter}">
                                                                                                                                </div>
                                                                                                                            </div>

                                                                                                                            <div class="md:col-span-2  mt-7">
                                                                                                                                <div >
                                                                                                                                    <button type="submit" id="claps_submit_${counter}" name="claps_submit_${counter}" class="text-white transition-all duration-300 ease-linear bg-blue-500 border-blue-500 hover:bg-blue-600 hover:border-blue-600 hover:text-white active:bg-blue-600 active:border-blue-600 active:text-white focus:bg-blue-600 focus:border-blue-600 focus:text-white focus:ring focus:ring-blue-500/30 btn">${window.page.submit}</button>

                                                                                                                                    <button type="button" data-id="drills_${counter}" class="close_modal mr-2 text-white transition-all duration-300 ease-linear bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600 hover:text-white active:bg-red-600 active:border-red-600 active:text-white focus:bg-red-600 focus:border-red-600 focus:text-white focus:ring focus:ring-red-500/30 btn">${window.page.close}</button>
                                                                                                                                   
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                    </div>
                                                                                                            </form>`;
        }

        let select_fields = `<div class="hide_ md:col-span-12 md-2 entry_selector_div" id="entry_selector_${counter}">
                                                                    <div>
                                                                        <label for="" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.selected_entry_type}</label>
                                                                            <select class="col-span-12 sm:col-span-10 px-3 bg-white w-full border p-2 border-gray-400 rounded placeholder:text-sm focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-zink-700 dark:border-zink-50 dark:text-zink-200" name="entry_selector_${counter}" data-id="${counter}" disabled>
                                                                                  ${options}
                                                                                                                
                                                                            </select>
                                                                    </div>
                                                                </div>`;
        return `<div id="drills_${counter}" modal-center class="text-right bg-white fixed flex flex-col top-1/2 left-1/2  -translate-x-1/2 -translate-y-1/2 w-fit border border-dark-500 hide-modal transition-all duration-300 ease-in-out" >
                    <div class="w-full bg-white shadow rounded-md dark:bg-zink-700 dark:text-zink-200 dark:shadow">
                        <div class="hide_ flex items-center justify-between p-4 border-b border-gray-300 dark:border-zink-50"> 
                            <button data-id="drills_${counter}" type="button" class="close_modal mr-2 text-white transition-all duration-300 ease-linear bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600 hover:text-white active:bg-red-600 active:border-red-600 active:text-white focus:bg-red-600 focus:border-red-600 focus:text-white focus:ring focus:ring-red-500/30 btn"><i class="mdi mdi-close noti-icon text-16"></i></button>
                        </div>
                                <div class="p-4" id ="drills_${counter}_body">

                                    ${select_fields}

                                    ${drawer_form}
                                    ${clap_form}
                                    ${hinge_form}


                                </div>
                    </div>
                </div>`;


    }//ends subform_generation here

  
    function subform_generation(counter){
        let token = $("[name=csrfmiddlewaretoken]").val();

        return `<div id="drills_${counter}" modal-center class="text-right bg-white fixed flex flex-col top-1/2 left-1/2  -translate-x-1/2 -translate-y-1/2 w-fit border border-dark-500 hide-modal transition-all duration-300 ease-in-out">
                        <div class="flex items-center justify-between p-4 border-b border-gray-300 dark:border-zink-50"> 
                            <button data-id="drills_${counter}" type="button" class="close_modal mr-2 text-white transition-all duration-300 ease-linear bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600 hover:text-white active:bg-red-600 active:border-red-600 active:text-white focus:bg-red-600 focus:border-red-600 focus:text-white focus:ring focus:ring-red-500/30 btn"><i class="mdi mdi-close noti-icon text-16"></i></button>
                        </div>



                        <div class="p-4" id ="drills_${counter}_body">


                            <div class="md:col-span-12 md-2 entry_selector_div" id="entry_selector_${counter}">
                                <div>
                                    <label for="" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.choose_entry_type}</label>
                                        <select class="col-span-12 sm:col-span-10 px-3 bg-white w-full border p-2 border-gray-400 rounded placeholder:text-sm focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-zink-700 dark:border-zink-50 dark:text-zink-200 entry_selector" name="entry_selector_${counter}" data-id="${counter}">
                                            <option value="" disabled selected>${window.page.choose_entry_type}</option>
                                            <option value="drawer_sub_details_${counter}">${window.page.drawer}</option>
                                            <option value="claps_sub_details_${counter}">${window.page.claps}</option>
                                            <option value="hinge_sub_details_${counter}">${window.page.hinge}</option>                                
                                        </select>
                                </div>
                            </div>
                                                                                                

                                                                                                

                            <form style="display:none;" method="POST" class="subform_temp" id="drawer_sub_details_${counter}">

                                                                                                                 <input type="hidden" name="subform_type" value="drawer">

                                                                                                                 <input type="hidden" name="csrfmiddlewaretoken" value="${token}">

                                                                                                                <h6 class="text-15 font-semibold dark:text-white mb-4">${window.page.DrawerDetails}</h6>

                                                                                                                <div class="grid grid-cols-12 gap-x-4 md:gap-4" id="drawer_details_${counter}">
                                                                                                                        
                                                                                                                            <div class="md:col-span-2">
                                                                                                                                    <div>
                                                                                                                                        <label for="" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.DrawerType}</label>
                                                                                                                                        <select class="col-span-12 sm:col-span-10 px-3 bg-white w-full border p-2 border-gray-400 rounded placeholder:text-sm focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700  dark:bg-zink-700 dark:border-zink-50 dark:text-zink-200" required name="drawers_type" id="drawers_type_${counter}">
                                                                                                                                            
                                                                                                                                        </select>
                                                                                                                                    </div>
                                                                                                                            </div>
                                                                                                                

                                                                                                                
                                                                                                                            <div class="md:col-span-2">
                                                                                                                                    <div>
                                                                                                                                        <label class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200" for="grid-first-name">
                                                                                                                                                  ${window.page.DrawerCode}
                                                                                                                                        </label>
                                                                                                                                        <select class="col-span-12 sm:col-span-10 px-3 bg-white w-full border p-2 border-gray-400 rounded placeholder:text-sm focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700  dark:bg-zink-700 dark:border-zink-50 dark:text-zink-200" required name="drawers_code" id="drawers_code_${counter}">
                                                                                                                                        </select>
                                                                                                                                    </div>
                                                                                                                            </div>
                                                                                                                

                                                                                                                            <div class="md:col-span-2">
                                                                                                                                <div>
                                                                                                                                    <label for="" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.lo}</label>
                                                                                                                                    <input class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" required name="lo" id="lo_${counter}">
                                                                                                                                </div>
                                                                                                                            </div>

                                                                                                                            <div class="md:col-span-2">
                                                                                                                                <div>
                                                                                                                                    <label for="" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.ro}</label>
                                                                                                                                    <input class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" required name="ro" id="ro_${counter}">
                                                                                                                                </div>
                                                                                                                            </div>


                                                                                                                            <div class="md:col-span-2">
                                                                                                                                <div>
                                                                                                                                    <label for="" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.bo}</label>
                                                                                                                                    <input class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" required name="bo" id="bo_${counter}">
                                                                                                                                </div>
                                                                                                                            </div>

                                                                                                                            <div class="md:col-span-2  mt-7">
                                                                                                                                <div>
                                                                                                                                    <button type="submit" id="drawer_submit_${counter}" name="drawer_submit_${counter}" class="text-white transition-all duration-300 ease-linear bg-blue-500 border-blue-500 hover:bg-blue-600 hover:border-blue-600 hover:text-white active:bg-blue-600 active:border-blue-600 active:text-white focus:bg-blue-600 focus:border-blue-600 focus:text-white focus:ring focus:ring-blue-500/30 btn">${window.page.submit}</button>

                                                                                                                                    <button type="button" data-id="drills_${counter}" class="close_modal mr-2 text-white transition-all duration-300 ease-linear bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600 hover:text-white active:bg-red-600 active:border-red-600 active:text-white focus:bg-red-600 focus:border-red-600 focus:text-white focus:ring focus:ring-red-500/30 btn">${window.page.close}</button>



                                                                                                                                   
                                                                                                                                </div>
                                                                                                                            </div>

                                                                                                                </div>

                            </form>


                            <form style="display:none;" method="POST" class="subform_temp" id="claps_sub_details_${counter}">
                                                                                                                <input type="hidden" name="subform_type" value="claps">
                                                                                                                <input type="hidden" name="csrfmiddlewaretoken" value="${token}">
                                                                                                                <h6 class="text-15 font-semibold dark:text-white mb-4 mt-4">${window.page.ClapsDetails}</h6>
                                                                                                                <div class="grid grid-cols-12 gap-x-4 md:gap-4 mb-4 mt-4" id="claps_${counter}_details">
                                                                                                                        
                                                                                                                            <div class="md:col-span-2">
                                                                                                                                    <div>
                                                                                                                                        <label for="clap_pr" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.ClapsPr}</label>
                                                                                                                                        <select class="col-span-12 sm:col-span-10 px-3 bg-white w-full border p-2 border-gray-400 rounded placeholder:text-sm focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700  dark:bg-zink-700 dark:border-zink-50 dark:text-zink-200" required name="clap_pr" id="clap_pr_${counter}">
                                                                                                                                        </select>
                                                                                                                                    </div>
                                                                                                                            </div>

                                                                                                                            <div class="md:col-span-2">
                                                                                                                                <div>
                                                                                                                                    <label for="lo" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.lo}</label>
                                                                                                                                    <input class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" required name="lo" id="lo_${counter}">
                                                                                                                                </div>
                                                                                                                            </div>

                                                                                                                            <div class="md:col-span-2">
                                                                                                                                <div>
                                                                                                                                    <label for="ro" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.ro}</label>
                                                                                                                                    <input class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" required name="ro" id="ro_${counter}">
                                                                                                                                </div>
                                                                                                                            </div>


                                                                                                                            <div class="md:col-span-2">
                                                                                                                                <div>
                                                                                                                                    <label for="bo" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.bo}</label>
                                                                                                                                    <input class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" required name="bo" id="bo_${counter}">
                                                                                                                                </div>
                                                                                                                            </div>

                                                                                                                            <div class="md:col-span-2  mt-7">
                                                                                                                                <div >
                                                                                                                                    <button type="submit" id="claps_submit_${counter}" name="claps_submit_${counter}" class="text-white transition-all duration-300 ease-linear bg-blue-500 border-blue-500 hover:bg-blue-600 hover:border-blue-600 hover:text-white active:bg-blue-600 active:border-blue-600 active:text-white focus:bg-blue-600 focus:border-blue-600 focus:text-white focus:ring focus:ring-blue-500/30 btn">${window.page.submit}</button>

                                                                                                                                     <button type="button" data-id="drills_${counter}" class="close_modal mr-2 text-white transition-all duration-300 ease-linear bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600 hover:text-white active:bg-red-600 active:border-red-600 active:text-white focus:bg-red-600 focus:border-red-600 focus:text-white focus:ring focus:ring-red-500/30 btn">${window.page.close}</button>
                                                                                                                                   
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                    </div>
                            </form>


                            <form style="display:none;" method="POST" class="subform_temp" id="hinge_sub_details_${counter}">
                                                                                                                <input type="hidden" name="csrfmiddlewaretoken" value="${token}">
                                                                                                                <input type="hidden" name="subform_type" value="hinge">

                                                                                                                <h6 class="text-15 font-semibold dark:text-white mb-4">${window.page.HingeDetails}</h6>
                                                                                                                <div class="grid grid-cols-12 gap-x-4 md:gap-4 mb-4" id="hinge_details_${counter}">
                                                                                                                         
                                                                                                                         <div class="md:col-span-4">
                                                                                                                                <div>
                                                                                                                                    <label for="hinge_provider" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.HingeProvider}</label>
                                                                                                                                    <select class="col-span-12 sm:col-span-10 px-3 bg-white w-full border p-2 border-gray-400 rounded placeholder:text-sm focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700  dark:bg-zink-700 dark:border-zink-50 dark:text-zink-200"  required name="hinge_provider" id="hinge_provider_${counter}">
                                                                                                                                    </select>
                                                                                                                                </div>
                                                                                                                        </div>

                                                                                                                         <div class="md:col-span-4">
                                                                                                                                <div>
                                                                                                                                    <label for="door_operning_side" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.DoorOpeningSide}</label>
                                                                                                                                    <select class="col-span-12 sm:col-span-10 px-3 bg-white w-full border p-2 border-gray-400 rounded placeholder:text-sm focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700  dark:bg-zink-700 dark:border-zink-50 dark:text-zink-200"  required name="door_operning_side" id="door_operning_side_${counter}">
                                                                                                                                       
                                                                                                                                        
                                                                                                                                        
                                                                                                                                    </select>
                                                                                                                                </div>
                                                                                                                        </div>


                                                                                                                         <div class="md:col-span-4">
                                                                                                                            <div>
                                                                                                                                <label for="dty" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.dty}</label>
                                                                                                                                <select class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" required name="dty" id="dty_${counter}">
                                                                                                                                <option value="${window.page.dty_option1}">${window.page.dty_option1}</option>
                                                                                                                                <option value="${window.page.dty_option2}">${window.page.dty_option2}</option>
                                                                                                                                </select>
                                                                                                                            </div>
                                                                                                                        </div>

                                                                                                                         <div class="md:col-span-4 mt-4">
                                                                                                                            <div>
                                                                                                                                <label for="yp" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.yp}</label>
                                                                                                                                <input class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" required name="yp" id="yp_${counter}">
                                                                                                                            </div>
                                                                                                                        </div>

                                                                                                                        <div class="md:col-span-4 mt-4">
                                                                                                                            <div>
                                                                                                                                <label for="nh" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.nh}</label>
                                                                                                                                <input class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200 nh_counter_field" data-id="${counter}" required name="nh" type="number" min="1" max="6" id="nh_${counter}">
                                                                                                                            </div>
                                                                                                                        </div>


                                                                                                                        <div class="md:col-span-4 xp1_div_${counter} mt-4" style="display:none;">
                                                                                                                                <div>
                                                                                                                                    <label for="xp1" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.xp1}</label>
                                                                                                                                    <input class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" name="xp1" id="xp1_${counter}">
                                                                                                                                </div>
                                                                                                                        </div>

                                                                                                                        <div class="md:col-span-4 xp2_div_${counter} mt-4" style="display:none;">
                                                                                                                            <div>
                                                                                                                                <label for="xp2" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.xp2}</label>
                                                                                                                                <input class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" name="xp2" id="xp2_${counter}">
                                                                                                                            </div>
                                                                                                                        </div>

                                                                                                                         <div class="md:col-span-4 xp3_div_${counter} mt-4" style="display:none;">
                                                                                                                            <div>
                                                                                                                                <label for="xp3" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.xp3}</label>
                                                                                                                                <input class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" name="xp3" id="xp3_${counter}">
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                         <div class="md:col-span-4 xp4_div_${counter} mt-4" style="display:none;">
                                                                                                                            <div>
                                                                                                                                <label for="xp4" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.xp4}</label>
                                                                                                                                <input class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" name="xp4" id="xp4_${counter}">
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                       <div class="md:col-span-4 xp5_div_${counter} mt-4" style="display:none;">
                                                                                                                            <div>
                                                                                                                                <label for="xp5" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.xp5}</label>
                                                                                                                                <input class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" name="xp5" id="xp5_${counter}">
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                         
                                                                                                                        <div class="md:col-span-4 xp6_div_${counter} mt-4" style="display:none;">
                                                                                                                            <div>
                                                                                                                                <label for="xp6" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.xp6}</label>
                                                                                                                                <input class="w-full border py-2 px-3 text-13 rounded border-gray-400 placeholder:text-13 focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent placeholder:text-gray-600 dark:border-zink-50 dark:placeholder:text-zink-200" name="xp6" id="xp6_${counter}">
                                                                                                                            </div>
                                                                                                                        </div>


                                                                                                                        <div class="md:col-span-2 mt-10">
                                                                                                                            <div>
                                                                                                                                
                                                                                                                                <button type="submit" id="hinge_submit_${counter}" name="hinge_submit_${counter}"  class="text-white transition-all duration-300 ease-linear bg-blue-500 border-blue-500 hover:bg-blue-600 hover:border-blue-600 hover:text-white active:bg-blue-600 active:border-blue-600 active:text-white focus:bg-blue-600 focus:border-blue-600 focus:text-white focus:ring focus:ring-blue-500/30 btn">${window.page.submit}</button>

                                                                                                                                 <button type="button" data-id="drills_${counter}" class="close_modal mr-2 text-white transition-all duration-300 ease-linear bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600 hover:text-white active:bg-red-600 active:border-red-600 active:text-white focus:bg-red-600 focus:border-red-600 focus:text-white focus:ring focus:ring-red-500/30 btn">${window.page.close}</button>
                                                                                                                               
                                                                                                                            </div>
                                                                                                                        </div>

                                                                                                                </div>
                            </form>


                        </div>



                    </div>
                </div>`;


    }//ends subform_generation here


    function notes_form_generation(row_count){
        let token = $("[name=csrfmiddlewaretoken]").val();
        return `<div id="drills_${row_count}_notes" modal-center class="text-right fixed flex flex-col top-1/2 left-1/2  -translate-x-1/2 -translate-y-1/2 w-fit hide-modal border border-dark-500 transition-all duration-300 ease-in-out">
                    <div class="w-full bg-white shadow rounded-md dark:bg-zink-700 dark:text-zink-200 dark:shadow">
                        <div class="hide_ flex items-center justify-between p-4 border-b border-gray-300 dark:border-zink-50"> 
                            

                            <button data-id="drills_${row_count}_notes" type="button" class="close_modal mr-2 text-white transition-all duration-300 ease-linear bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600 hover:text-white active:bg-red-600 active:border-red-600 active:text-white focus:bg-red-600 focus:border-red-600 focus:text-white focus:ring focus:ring-red-500/30 btn"><i class="mdi mdi-close noti-icon text-16"></i></button>
                        </div>
                                                                                                

                                                                                                <div class="p-4" id ="drills_${row_count}_notes_body">

                                                                                                            <form method="POST" id="notes_details_${row_count}" class="subform_temp">
                                                                                                                 <input type="hidden" name="csrfmiddlewaretoken" value="${token}">
                                                                                                                <h6 class="text-15 font-semibold dark:text-white mb-4">${window.page.notes}</h6>

                                                                                                                <div class="grid grid-cols-12" id="notes_details_${row_count}">
                                                                                                                        
                                                                                                                        
                                                                                                                <input type="hidden" name="subform_type" value="notes">
                                                                                                                                
                                                                                                                        <div class="md:col-span-12">
                                                                                                                                       
                                                                                                                                        <textarea class="px-3 w-full border p-2 border-gray-400 rounded placeholder:text-13 focus:border focus:border-gray-400 placeholder:text-gray-600 focus:ring-0 focus:outline-none text-gray-700 text-13 dark:bg-transparent dark:border-zink-50 dark:text-zink-200 dark:placeholder:text-zink-200" rows="3" id="notes_${row_count}" name="notes" required></textarea>
                                                                                                                        </div>

                                                                                                                          

                                                                                                                            <div class="md:col-span-4 mt-7">
                                                                                                                                <div>
                                                                                                                                    <button type="submit" class="text-white transition-all duration-300 ease-linear bg-blue-500 border-blue-500 hover:bg-blue-600 hover:border-blue-600 hover:text-white active:bg-blue-600 active:border-blue-600 active:text-white focus:bg-blue-600 focus:border-blue-600 focus:text-white focus:ring focus:ring-blue-500/30 btn">${window.page.submit}</button>
                                                                                                                                        <button type="button" data-id="drills_${row_count}_notes" class="close_modal mr-2 text-white transition-all duration-300 ease-linear bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600 hover:text-white active:bg-red-600 active:border-red-600 active:text-white focus:bg-red-600 focus:border-red-600 focus:text-white focus:ring focus:ring-red-500/30 btn">${window.page.close}</button>
                                                                                                                                </div>

                                                                                                                                 





                                                                                                                            </div>

                                                                                                                </div>

                                                                                                            </form>


                                                                                                            


                                                                                                </div>



                                                                                            </div>
                                                                                    </div>`;

    }


    $(document).on('change','.entry_selector', function(){
        let selected_entry = $(this).find(":selected").val();
        let data_id = $(this).attr('data-id');
        
        $(`#drills_${data_id} .subform_temp`).hide();
        $(`#${selected_entry}`).show();
        $('.entry_selector_div').addClass('hide_');
        // $(this).prop("disabled", true); // Disable the select element
    });






    function notes_form_generation_edit(row_count, obj){
        let token = $("[name=csrfmiddlewaretoken]").val();
        return `<div id="drills_${row_count}_notes" modal-center class="text-right fixed flex flex-col top-1/2 left-1/2  -translate-x-1/2 -translate-y-1/2 w-fit hide-modal border border-dark-500 transition-all duration-300 ease-in-out">
                    <div class=" w-full bg-white shadow rounded-md dark:bg-zink-700 dark:text-zink-200 dark:shadow">
                        <div class=" hide_ flex items-center justify-between p-4 border-b border-gray-300 dark:border-zink-50">
                            <button data-id="drills_${row_count}_notes" type="button" class="close_modal text-white transition-all duration-300 ease-linear bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600 hover:text-white active:bg-red-600 active:border-red-600 active:text-white focus:bg-red-600 focus:border-red-600 focus:text-white focus:ring focus:ring-red-500/30 btn"><i class="mdi mdi-close noti-icon text-16"></i></button>
                        </div>
                                                                                                

                                                                                                <div class="p-4" id ="drills_${row_count}_notes_body">




                                                                                                            <form method="POST" id="notes_details_${row_count}" class="subform_temp">
                                                                                                                 <input type="hidden" name="csrfmiddlewaretoken" value="${token}">
                                                                                                                <h6 class="text-15 font-semibold dark:text-white mb-4">${window.page.notes}</h6>

                                                                                                                <div class="grid grid-cols-12" id="notes_details_${row_count}">
                                                                                                                        
                                                                                                                        
                                                                                                                <input type="hidden" name="subform_type" value="notes">
                                                                                                                                
                                                                                                                        <div class="md:col-span-12">
                                                                                                                                       
                                                                                                                                        <textarea class="px-3 w-full border p-2 border-gray-400 rounded placeholder:text-13 focus:border focus:border-gray-400 placeholder:text-gray-600 focus:ring-0 focus:outline-none text-gray-700 text-13 dark:bg-transparent dark:border-zink-50 dark:text-zink-200 dark:placeholder:text-zink-200" rows="3" id="notes_${row_count}" name="notes" required>${obj.card_notes}</textarea>
                                                                                                                        </div>

                                                                                                                          

                                                                                                                            <div class="md:col-span-4 mt-7">
                                                                                                                                <div >
                                                                                                                                    <button type="submit" class="text-white transition-all duration-300 ease-linear bg-blue-500 border-blue-500 hover:bg-blue-600 hover:border-blue-600 hover:text-white active:bg-blue-600 active:border-blue-600 active:text-white focus:bg-blue-600 focus:border-blue-600 focus:text-white focus:ring focus:ring-blue-500/30 btn">${window.page.submit}</button>
                                                                                                                                    

                                                                                                                                     <button type="button" data-id="drills_${row_count}_notes" class="close_modal mr-2 text-white transition-all duration-300 ease-linear bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600 hover:text-white active:bg-red-600 active:border-red-600 active:text-white focus:bg-red-600 focus:border-red-600 focus:text-white focus:ring focus:ring-red-500/30 btn">${window.page.close}</button>

                                                                                                                                </div>
                                                                                                                            </div>

                                                                                                                </div>

                                                                                                            </form>


                                                                                                            


                                                                                                </div>



                                                                                            </div>
                                                                                    </div>`;

    }


    // keep_flow_tracker = start_tracking_forkeepflow();
    
    function start_tracking(){
        var liust__ = [];
        $(`select[name='collection_barcode[]']`).each(function() {
                    let value = $(this).val();
                    let data_id = $(this).data('id');
                    let selectedValue = $(`#collection_${data_id}_order_item_knobfamily_bool`).val();
                    var mappedValue = (selectedValue == 1) ? "yes" : "no";
                    if (value !== null && value.length > 0)
                        liust__.push({[$(`#collection_barcode_${data_id}`).find(':selected').val()]: mappedValue });
        });
        return liust__;
    }

    // function start_tracking_forkeepflow(){
    //     var track = [];
    //     $(`input[class='collection_edit_tracker']`).each(function() {
    //                 let value = $(this).val();
    //                 let data_id = $(this).data('id');
    //                 console.log(value, data_id);
    //                 //let selectedValue = $(`#collection_${data_id}_order_item_knobfamily_bool`).val();

    //                 // var mappedValue = (selectedValue == 1) ? "yes" : "no";
    //                 // if (value !== null && value.length > 0)
    //                 //     track.push({[$(`#collection_barcode_${data_id}`).find(':selected').val()]: mappedValue });
    //     });
    //     return track;
    // }



    function getKnobValue(barcodeCollectionId, dataList) {
        for (let data of dataList) {
            if (data.barcode_collection_id === barcodeCollectionId) {
                return data.barcode_collection_knob;
            }
        }
        return null; // Return null if the ID is not found
    }

    function get_all_collection_barcode_from_above_form(){
        var all_collections_edit__ = [];

        $(`select[name='collection_barcode[]']`).each(function() {
            let value = $(this).val();
            let data_id = $(this).data('id');
            let value_id = $(this).find(':selected').data('id');
            let selectedValue = parseInt($(`#collection_${data_id}_order_item_knobfamily_bool`).val());
            all_collections_edit__.push({
                'barcode_collection_name':value,
                'barcode_collection_id':value_id,
                'barcode_collection_knob':selectedValue,
            })
        });
        return all_collections_edit__;
    }
    var card_data = JSON.parse ($("#card_data").val());
    var product_type = $("#product_type").val();
    if (product_type == window.page.door)
        $("#create_order_form_step_6").show();
        
    let decision = $("#decision").val();
    if (decision == "yes"){
        $("#collection_label_1").html(window.page.collection_barcode1);
        $("#collection_label_2").html(window.page.collection_barcode1);
        $("#collection_label_3").html(window.page.collection_barcode1);
    }
    let collection_data_count = $("#collection_data_count").val();
    let collection_data = $("#collection_data").val();
    // console.log(collection_data);
    console.log("card_data at 1091",card_data);
    let total_quantity = 0;
    $.each(card_data, function(index, obj) {

        index = index.replace("card_","");
        $("table#order_table tbody#order_table_tbody").append(generate_row_edit(index, obj));
        // if (decision == "no"){

        // }
        //knobs_tracker
        let knob_flag = getKnobValue(parseInt(obj.collection_barcode_id), get_all_collection_barcode_from_above_form());
        console.log("knob_flag=",knob_flag);
        //console.log("get_all_collection_barcode_from_above_form=",get_all_collection_barcode_from_above_form());
        if (knob_flag == 1){
            
            specific_knob_family_edit(index, obj);  
            if (obj.knob_position_id != ''){
                get_knob_position_edit(populateRowData_KnobPositionEdit, index, obj);
                $(`#knob_position_${index}`).removeClass('hide_');
            }else{
                $(`#knob_position_${index}`).append('<option value="" selected></option>');
            }
        }else if (decision == "no"){
            console.log("I am at 1047");
            if (findById(knobs_tracker, 3)){
                let obj_matcher = findById(knobs_tracker, 3);
                if (obj_matcher[$("#collection_barcode_3").find(":selected").val()] === "yes"){
                    console.log("I am at 1051");
                    specific_knob_family_edit(index, obj);

                    if (obj.knob_position_id != ''){
                        get_knob_position_edit(populateRowData_KnobPositionEdit, index, obj);
                        $(`#knob_position_${index}`).removeClass('hide_');
                    }else{
                        $(`#knob_position_${index}`).append('<option value="" selected></option>');
                    }
                }
            }
        }
        get_door_opening_sides_edit(populateRowData_DoorSidesEdit, index, obj);
        get_hinge_provider_edit(populateRowData_HingeProviderEdit, index, obj);
        get_claps_pr_provider_edit(populateRowData_clap_pr_providerEdit, index, obj);
        get_drawer_data_edit(populateRowData_DrawarDataEdit, index, obj);
        total_quantity+= parseInt(obj.card_quantity);
        /////////// card generation /////////////////
        let token = $("[name=csrfmiddlewaretoken]").val();
        
        if (obj.card_drawer_length > 0){
            var da = obj.card_drawer[0];
            let obb = {
                [`row_${index}_drawer`]: {
                    "csrfmiddlewaretoken": token,
                    "subform_type": "drawer",
                    "drawers_type": da.drawar_order_type,
                    "drawers_code": da.drawar_order_code,
                    "lo": da.drawar_order_lo,
                    "ro":da.drawar_order_ro,
                    "bo":da.drawar_order_bo
                }
            };

            cards.push(obb);
        } 

        if (obj.card_clap_length > 0){
            var da = obj.card_clap[0];
           
            let obb = {
                [`row_${index}_claps`]: {
                    "csrfmiddlewaretoken": token,
                    "subform_type": "claps",
                    "clap_pr": da.clap_claps_pr,
                    "lo": da.clap_order_lo,
                    "ro":da.clap_order_ro,
                    "bo":da.clap_order_bo
                }
            };

            cards.push(obb);

        } 

        if (obj.card_hinge_length > 0){
            var da = obj.card_hinge[0];
            let obb = {
                [`row_${index}_hinge`]: {
                    "csrfmiddlewaretoken": token,
                    "subform_type": "hinge",
                    "hinge_provider": da.hinge_order_provider,
                    "door_operning_side": da.hinge_order_door_opening_side,
                    "dty": da.hinge_order_dty,
                    "yp": da.hinge_order_yp,
                    "xp1": da.hinge_order_xp1,
                    "xp2": da.hinge_order_xp2,
                    "xp3": da.hinge_order_xp3,
                    "xp4": da.hinge_order_xp4,
                    "xp5": da.hinge_order_xp5,
                    "xp6": da.hinge_order_xp6
                }
            };
            cards.push(obb);
        }

       
        let obb = {
                [`row_${index}_notes`]: {
                    "csrfmiddlewaretoken": token,
                    "subform_type": "notes",
                    "notes": obj.card_notes,
                }
            };
        cards.push(obb);

        if (decision === "yes" && collection_data_count > 1){
            // console.log("I worked at 1031");
            get_collection_data_edit(populateRowData_CollectionEdit, index, obj);
        }




    });

    if (decision  === "yes" && collection_data_count >= 1){
        $('table#order_table tbody td:first-child').removeClass('hide_');
        $('table#order_table thead th:first-child').removeClass('hide_');
        if (collection_data_count < 3)
            $("#create_order_form_add_collection_div").show();
        
    }



    $("#quatity_counter").html(total_quantity);
    ////////////////////////////

    console.log(cards);







    // $(document).on('click','.keep_flow_decision_btn',function(){
    //     let step_count = $(this).attr('data-id');
    //     let label = $(this).attr('data-label');
    //     // console.log("label",label);
    //     // console.log("step_count",step_count);

    //     $(`div#create_order_form_step_${step_count} .keep_flow_decision_btn`).removeClass('active-button');
    //     $(this).addClass('active-button');

    //     // let input = `<input type="hidden" name="keepflow_${step_count}" class="keepflow_counter" id="keepflow_${step_count}" value="${label}">`;
    //     // $(`#keep_flow_tracker_step_${step_count}`).empty().append(input);
    //      $(`#keep_flow_tracker_step_${step_count} #keepflow_${step_count}`).val(label);
    // });
    function updateOrPush(arr, key, newValue) {
        let keyExists = false;

        // Iterate through the array to check if the key exists
        arr.forEach(obj => {
            if (obj.hasOwnProperty(key)) {
                obj[key] = newValue;
                keyExists = true;
            }
        });

        // If the key does not exist, push a new object with the key-value pair
        if (!keyExists) {
            let newObj = {};
            newObj[key] = newValue;
            arr.push(newObj);
        }

        return arr;
    }

    $(document).on('click','.keep_flow_decision_btn',function(){
        let step_count = $(this).attr('data-id');
        let label = $(this).attr('data-label');
        console.log("label",label);
        console.log("step_count",step_count);
        let value_  = $(`#collection_barcode_${step_count}`).find(':selected').val();
        // keep_flow_tracker.push({[$(`#collection_barcode_${step_count}`).find(':selected').val()]: label });

        keep_flow_tracker = updateOrPush(keep_flow_tracker, value_, label);
        console.log("label",label);
        console.log("step_count",step_count);
        console.log(keep_flow_tracker);
        $(`div#create_order_form_step_${step_count} .keep_flow_decision_btn`).removeClass('active-button');
        $(this).addClass('active-button');

        // let input = `<input type="hidden" name="keepflow_${step_count}" class="keepflow_counter" id="keepflow_${step_count}" value="${label}">`;
        // let input = `<input type="hidden" name="keepflow[]" class="keepflow_counter" id="keepflow_${step_count}" value="${label}">`;
        // $(`#keep_flow_tracker_step_${step_count} #keepflow_${step_count}`).empty().append(input);

        $(`#keep_flow_tracker_step_${step_count} #keepflow_${step_count}`).val(label);
    });


    
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

    


    function get_knob_family(callback, step_number, element_names, keys){
        $.ajax({
                url:$("#link_to_grab_order_page_data_").val(), // add url for posting request
                method:'POST',
                data:{
                    data_requirement:'knob_family', 
                },
                dataType:'JSON',
                success:function(data){
                    callback(data, step_number, element_names, keys);
                }
        }); //end ajax call here
       
    } //end get_knob_family func here


    function get_knob_family_edit(callback, step_number, element_names, keys){
        $.ajax({
                url:$("#link_to_grab_order_page_data_").val(), // add url for posting request
                method:'POST',
                data:{
                    data_requirement:'knob_family', 
                },
                dataType:'JSON',
                success:function(data){
                    callback(data, step_number, element_names, keys);
                }
        }); //end ajax call here
       
    } //end get_knob_family_edit func here



    function get_drawer(callback, step_number, element_names, keys){
        $.ajax({
                url:$("#link_to_grab_order_page_data_").val(), // add url for posting request
                method:'POST',
                data:{
                    data_requirement:'drawer', 
                },
                dataType:'JSON',
                success:function(data){
                    callback(data, step_number, element_names, keys);
                }
        }); //end ajax call here
       
    } //end get_drawer func here



    function handledrawerData(drawerData, step_number, element_names, keys) {
            if (drawerData !== null) {
                $.each(keys, function(index,key){
                    console.log(index, key);
                    let elem_name = `div#create_order_form_step_${step_number} select[name='${element_names[index]}']`;
                    // console.log(elem_name);
                    var selectElement =  $(elem_name);
                    // console.log(selectElement);
                    if (selectElement){
                        // console.log("selectElement found",selectElement);
                            $.each(drawerData.data, function (index, item) {
                                console.log(item);
                                selectElement.append($('<option>', {
                                value: item[key],
                                text: item[key]
                            }
                            ));
                        }); //end second each
                    }
                }); // end first each
            } else{
                console.log("Error at handledrawerData func");
            }
    } //end handledrawerData here


   

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
                                    if (item.in_stock_bool == 1){
                                        selectElement.append($('<option>', {
                                                value: item[key],
                                                text: item[key],
                                                'data-id':item['collection_id'],
                                                'data-flow':item['flow'],
                                                'data-back':item['back'],
                                                'data-kant':item['kant'],
                                                'data-minorder':item['min_order'],
                                                'data-collection':item['collection_name'],
                                                'data-description':item['description'],
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


    

    // function handleKnobFamilyData(collectionData, step_number, element_names, keys) {
    //         if (collectionData !== null) {
    //             $.each(keys, function(index,key){
    //                 console.log(index, key);
    //                 let elem_name = `div#create_order_form_step_${step_number} select[name='${element_names[index]}']`;
    //                 var selectElement =  $(elem_name);
    //                 if (selectElement){
    //                     // console.log("selectElement found",selectElement);
                        
    //                         selectElement.append($('<option>', {
    //                                     value: '',
    //                                     text: 'select a value'
    //                             }
    //                         ));


    //                         $.each(collectionData.data, function (index, item) {
                                
    //                             selectElement.append($('<option>', {
    //                                 value: item[key],
    //                                 text: item[key]
    //                             }
    //                         ));
    //                     }); //end second each
    //                 }
    //             }); // end first each
    //         } else{
    //             console.log("Error at handleKnobFamilyData func");
    //         }
    // } //end handleKnobFamilyData here

     function handleKnobFamilyData(collectionData, step_number, element_names, keys) {
            if (collectionData !== null) {
                $.each(keys, function(index,key){
                    // console.log(index, key);
                    let elem_name = `div#create_order_form_step_${step_number} select[name='${element_names[index]}']`;
                    var selectElement =  $(elem_name).empty();
                    if (selectElement){
                        // console.log("selectElement found",selectElement);
                        
                            selectElement.append($('<option>', {
                                    value: '',
                                    text: window.page.select_a_value
                                }
                            ));


                            $.each(collectionData.data, function (index, item) {
                                
                                selectElement.append($('<option>', {
                                    value: item[key],
                                    text: item[key],
                                    'data-id': item['knob_color_bool'],
                                }
                            ));
                        }); //end second each
                    }
                }); // end first each
            } else{
                console.log("Error at handleKnobFamilyData func");
            }
    } //end handleKnobFamilyData here







    $(document).on('change','input[type="file"]',function(event){

                const selectedFile = event.target.files[0];
                const fileName = selectedFile.name.toLowerCase();
                let all_exts = ['.png','.jpg','jpeg','.gif']
                if (all_exts.some(ext => fileName.endsWith(ext))) {
                   
                     let id_ = $(this).attr('id');
                    console.log('Valid file selected:', fileName);
                    console.log('id_:', id_);
                    // $(`#upload_file_tracker_${id_}`).val(1);
                    if ($(this).attr('data-list')){
                                let index = $(this).attr('data-id'); 
                                let order_item_id = $(this).attr('data-list');
                                var formData = new FormData();
                                formData.append('uploaded_file', $(this)[0].files[0]);
                                formData.append('order_id',$("#order_id").val());
                                formData.append('index',index);
                                formData.append('order_item_id',order_item_id);
                                formData.append('step','collection_image_updation');
                                formData.append('action','insert');

                                $.ajax({
                                    url: $("#link_to_add_").val(),  // Your Django view URL
                                    type: 'POST',
                                    data: formData,
                                    processData: false,
                                    contentType: false,
                                    success: function(response) {
                                        if (response.success) {
                                            console.log('Image uploaded successfully.');
                                            $("#collection_img_"+index).parent().remove();
                                            // Handle success, such as showing a success message
                                        } else {
                                            console.log('Image upload failed.');
                                            // Handle failure, such as showing an error message
                                        }
                                    },
                                    error: function(xhr, status, error) {
                                        console.error('Image upload error:', error);
                                        // Handle error, such as showing an error message
                                    }
                                }); //end ajax here
                    }else{
                        $(`#upload_file_tracker_${id_}`).val(1);
                    }
                    // Handle the file or perform further actions
                } else {
                     let error_msg = window.page.image_error_msg;
                    Swal.fire({
                            position: 'center',
                            icon: 'warning',
                            title: error_msg,
                            showConfirmButton: false,
                            timer: 3000
                    });
                    // Clear the file input
                    $('#upload_file').val('');
                }
        
    });


    function html_fields_generation(decision, target_count){

            let text_mapper = window.page.collection_barcode;
        
        let d = $("#decision").val();
        if (d == "yes")
            text_mapper = window.page.collection_barcode1;
        let html_ = [`<div class="md:col-span-6">
                                                        <div>
                                                            <label for="collection_barcode" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${text_mapper}</label>
                                                            <select class="use_select2 col-span-12 sm:col-span-10 px-3 bg-white w-full border p-2 border-gray-400 rounded placeholder:text-sm focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-zink-700 dark:border-zink-50 dark:text-zink-200"  name="collection_barcode[]" data-id="${target_count}"  id="collection_barcode_${target_count}" required>
                                                               
                                                                
                                                            </select>
                                                        </div>
                                                </div>

                                                <div class="md:col-span-6">
                                                       

                                                        <table id="collection_table_${target_count}" class="w-full text-sm ltr:text-left rtl:text-right text-gray-500" style="display:none;">
                                                                
                                                            <thead class="text-sm text-gray-700 dark:text-zink-200">
                                                                    <tr class="border border-gray-300 dark:border-zink-50">
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
                                                                    </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr class="bg-white border border-gray-300 dark:border-zink-50 dark:bg-zink-700" id="collection_table_row_${target_count}">
                                                                   
                                                                </tr>
                                                                
                                                            </tbody>
                               
                                                        </table>


                                                </div>

                                                <div class="md:col-span-2"  style="display:none;" id="keepflow_div_${target_count}">
                                                        
                                                            <div>
                                                                <label for="keepflow" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.keep_flow}</label>
                                                                <div class="flex space-x-4">
                                                                    <input type="radio" id="keepflow_yes_${target_count}" data-id="${target_count}"  class="hidden">
                                                                    <label for="keepflow_yes_${target_count}" class="text-gray-600 transition-all duration-300 ease-linear dark:bg-zink-50 dark:border-transparent border-gray-50 bg-gray-50 hover:bg-gray-600 hover:border-gray-600 hover:text-white active:bg-gray-600 active:border-gray-600 active:text-white focus:bg-gray-600 focus:ring focus:ring-gray-600/30 focus:border-gray-600 focus:text-white btn keep_flow_decision_btn" data-label="yes" data-id="${target_count}">${window.page.yes}</label>

                                                                    <input type="radio" id="keepflow_no_${target_count}" data-id="${target_count}"  value="0" class="hidden">
                                                                    <label for="keepflow_no" class="text-gray-600 transition-all duration-300 ease-linear dark:bg-zink-50 dark:border-transparent border-gray-50 bg-gray-50 hover:bg-gray-600 hover:border-gray-600 hover:text-white active:bg-gray-600 active:border-gray-600 active:text-white focus:bg-gray-600 focus:ring focus:ring-gray-600/30 focus:border-gray-600 focus:text-white btn keep_flow_decision_btn" data-label="no" data-id="${target_count}">${window.page.no}</label>
                                                                </div>
                                                            </div>
                                                        
                                                </div>


                                                <div id="keep_flow_tracker_step_${target_count}" style="display:none;" >
                                                    <input type="hidden" name="keepflow[]" class="keepflow_counter" id="keepflow_${target_count}" value="0">
                                                </div>

                                                <div class="md:col-span-2" style="display:none;" id="texture_div_${target_count}">
                                                        <div>
                                                            <label for="texture" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.texture}</label>
                                                            <select class="col-span-12 sm:col-span-10 px-3 bg-white w-full border p-2 border-gray-400 rounded placeholder:text-sm focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700  dark:bg-zink-700 dark:border-zink-50 dark:text-zink-200"  name="texture[]" required>
                                                               
                                                                <option value="${window.page.keep_flow_height}">${window.page.keep_flow_height}</option>
                                                                <option value="${window.page.keep_flow_width}">${window.page.keep_flow_width}</option>
                                                                
                                                            </select>
                                                        </div>
                                                </div>


                                                <div class="md:col-span-4"  style="display:none;" id="upload_file_div_${target_count}">
                                                             <div>
                                                                <label for="upload_file" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.uploadfile}</label>
                                                                <input class="relative m-0 block w-full min-w-0 flex-auto cursor-pointer rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] font-normal leading-[2.15] text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:cursor-pointer file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-zink-50 dark:text-zink-200 dark:file:bg-zink-50 dark:file:text-zink-200 dark:focus:border-primary"  type="file" accept=".jpg, .jpeg, .png, .gif"  name="upload_file[]"  id="${target_count}"/>

                                                                <input type="hidden" name="upload_file_tracker[]" class="upload_file_tracker" id="upload_file_tracker_${target_count}" value="0">
                                                            </div>
                                                </div>`];
       
        
        let question_ = `<div class="md:col-span-12" id="keepflow_question_${target_count}" style="display:none;">
                                                        
                                                                    <div class="custom-radio form-check form-check-inline">
                                                                        <label class="block font-medium text-gray-700 mb-2 dark:text-zink-200">${window.page.keepflow_question} </label>
                                                                       
                                                                         <input   data-id="${target_count}" class="w-3 h-3 text-blue-600 bg-gray-300 border border-gray-400 rounded-full appearance-none checked:bg-blue-500 checked:border-blue-500 dark:bg-transparent dark:border-zink-300" type="radio" name="keep_flow_question_${target_count}" value="no">
                                                                        <label class="text-gray-600 dark:text-zink-200 " for="customRadioInline2">${window.page.no}</label>
                                                                       
                                                                        <br/>
                                                                         <input  data-id="${target_count}"  class="w-3 h-3 mt-2 text-blue-600 bg-gray-300 border border-gray-400 rounded-full appearance-none checked:bg-blue-500 checked:border-blue-500 dark:bg-transparent dark:border-zink-300" type="radio" name="keep_flow_question_${target_count}" value="yes">
                                                                        <label class="text-gray-600 dark:text-zink-200" for="customRadioInline1">${window.page.yes}</label>
                                                                       
                                                                    </div>
                                                        
                                                </div> <input type="hidden" name="collection_${target_count}_order_item_knobfamily_bool" id="collection_${target_count}_order_item_knobfamily_bool" value="0" class="collection_edit_tracker">`;

        // if (decision == "yes")
            html_.push(`${question_}<div class="md:col-span-6 knob_div_${target_count}" style="display:none">
                                                        <div>
                                                            <label for="knob_family" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.knob_family}</label>
                                                            <select class="use_select2 col-span-12 sm:col-span-10 px-3 bg-white w-full border p-2 border-gray-400 rounded placeholder:text-sm focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700  dark:bg-zink-700 dark:border-zink-50 dark:text-zink-200" data-id="${target_count}"  name="knob_family[]" required>
                                                                
                                                                
                                                                
                                                            </select>
                                                        </div>
                                                </div>

                                                <div class="md:col-span-6 knob_div_${target_count}" style="display:none">
                                                        <div>
                                                            <label for="knob_color" class="block font-medium text-gray-700 text-13 mb-2 dark:text-zink-200">${window.page.knob_color}</label>
                                                            <select class="use_select2 col-span-12 sm:col-span-10 px-3 bg-white w-full border p-2 border-gray-400 rounded placeholder:text-sm focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700  dark:bg-zink-700 dark:border-zink-50 dark:text-zink-200 knob_color_selection" data-id="${parseInt(target_count) - 2}" name="knob_color[]" data-record="${parseInt(target_count)}" required>
                                                                
                                                            </select>
                                                        </div>
                                                </div>`);
        return html_.join('');
    }




    ///////////////// Mapping values ///////////////////

    function get_list_via_key(data,key){
        return $.map(data.data, function(item) {
            return item[key];
        });
    }

    function select2SelectBoxValuePopulation(response_list, element_name, found_value){
        
        // var element = $(element_name).empty();
        $.each(response_list, function(index, v) {
            
            var isSelected = (v === found_value); // Assuming "value" is the property to compare

            $(element_name).append($('<option>', {

                value:v, // Assuming "value" is the property for the option value
                text:v,   // Assuming "text" is the property for the option text
                selected: isSelected,
            }));
        });

    } //end select2SelectBoxValuePopulation here


    function inputTextValuePopulation(element_id, found_value){
        $('#'+element_id).val(found_value);
    } // end inputTextValuePopulation here
    

    




    // $('input[name="color_selection"]').change(function() {
    //     var selectedValue = $("input[name='color_selection']:checked").val();
    //     // console.log(selectedValue);
    //     $("#decision").val(selectedValue);
    //     $("#create_order_form_step_3, #create_order_form_step_4, #create_order_form_step_5").empty();
    //     $("#create_order_form_step_3").empty().append(html_fields_generation(selectedValue, 3));
    //     $("#add_collection_btn").attr("data-id",4);
    //     // $('input[name="color_selection"]').attr('disabled',true);
    //     if (selectedValue == "yes"){  // on yes choose this div will show up
    //         $("#create_order_form_add_collection_div").show();
    //     }else
    //          $("#create_order_form_add_collection_div").hide();
    //     $("#create_order_form_step_6 #order_table_tbody").empty();
    //     $("#create_order_form_step_6").hide();
    //     $("#create_order_form_step_3 select.use_select2").select2();
    //     get_collection(handleCollectionData, 3, ["collection_barcode[]","collection[]"], ["collection_barcode","description"]);
    //     //get_knob_family(handleKnobFamilyData, 3, ["knob_family[]","knob_color[]"], ["knob_family","knob_color"]);

    //     get_knob_family(handleKnobFamilyData, 3, ["knob_family[]"], ["knob_family"]);
        


    // }); //end input[name="color_selection"] event here


    $('input[name="color_selection"]').change(function() {
        //knobs_tracker = [];
        var selectedValue = $("input[name='color_selection']:checked").val();
        // console.log(selectedValue);
        $("#decision").val(selectedValue);
        $("#create_order_form_step_3, #create_order_form_step_4, #create_order_form_step_5").empty();
        $("#create_order_form_step_3").empty().append(html_fields_generation(selectedValue, 3));
        // $('#create_order_form_step_2').remove();
        $("#add_collection_btn").attr("data-id",4);
        $("#form_btn").hide();
        cards = [];
        knobs_tracker = [];   
        keep_flow_tracker = [];     

        // if (selectedValue == "yes")  // on yes choose this div will show up
        //     $("#create_order_form_add_collection_div").show();
        // else
        //     $("#create_order_form_add_collection_div").hide();
        if (selectedValue == "no"){
            $('table#order_table tbody td:first-child').addClass('hide_');
            $('table#order_table thead th:first-child').addClass('hide_');
        }else{
            $('table#order_table tbody td:first-child').removeClass('hide_');
            $('table#order_table thead th:first-child').removeClass('hide_');
        }

        $("#create_order_form_step_6 #order_table_tbody").empty();
        $("#create_order_form_step_6").hide();
        $("#create_order_form_step_3 select.use_select2").select2();
        //get_collection(handleCollectionData, 3, ["collection_barcode[]","collection[]"], ["collection_barcode","description"]);
        get_collection(handleCollectionData, 3, ["collection_barcode[]"], ["collection_barcode"]);
        
        $("#quatity_counter").html("0");
        $("#create_order_form_add_collection_div").hide();
        
    }); //end input[name="color_selection"] event here




    ///////////////// add event on collection barcode field and collection name both fields are dependent each other
    
      $(document).on('change','select[name="knob_color[]"]', function(){
     let data_id = $(this).attr('data-record');
        let decision = $("#decision").val();
         let updates = {
            'knob_color':$(this).val()
        };
        knobs_tracker = updateKnobInfo(knobs_tracker, parseInt(data_id), updates);
        console.log("knobs_tracker=",knobs_tracker);
        // let add_collection_btn_count = $("#add_collection_btn").attr('data-id');
        if (decision === "yes")
            $("#create_order_form_add_collection_div").show();
    });



    function updateKnobInfo(knobs_tracker, id_to_find, updates) {
        // Iterate through the list of objects
        for (let obj of knobs_tracker) {
            // Check if the id matches
            if (obj.id === id_to_find) {
                // Update the values if they are provided in the updates object
                for (let key in updates) {
                    if (updates.hasOwnProperty(key)) {
                        obj[key] = updates[key];
                    }
                }
                break; // Exit the loop once the object is found and updated
            }
        }
        return knobs_tracker;
    }
     $(document).on('change','select[name="knob_family[]"]', function(){
        let decision = $("#decision").val();

        
        let element_names = ["knob_color[]"];
        let keys = ["colorknob_description"];

        let data_id = $(this).attr('data-id');
        let selected_knob_family =  $(this).val();

        let updates = {
            'knob_family':selected_knob_family
        };
        knobs_tracker = updateKnobInfo(knobs_tracker, parseInt(data_id), updates);

        let selected_color_flag  = $(this).find(':selected').attr('data-id');
        // let element_names = ["collection[]"];
        // let keys = ["description"];
        let elem_name = `div#create_order_form_step_${data_id} select[name='${element_names[0]}']`;
        var selectElement =  $(elem_name).empty();
        console.log("selected_knob_family=",selected_knob_family);
        console.log("selected_color_flag=",selected_color_flag);
         // let elem_name = `div#create_order_form_step_${step_number} select[name='${element_names[index]}']`;
        if (selected_color_flag == 0){
            
             selectElement.append($('<option>', {
                    value: '',
                    text: window.page.select_a_value
                    }
            ));

            selectElement.append($('<option>', {
                value: window.page.nature,
                text:  window.page.nature,
            }
            ));

        }else{
            $.ajax({
                    url:$("#link_to_grab_order_page_data_").val(), // add url for posting request
                    method:'POST',
                    data:{
                        data_requirement:'knob_color', 
                    },
                    dataType:'JSON',
                    success:function(data){
                        let data__ = data.data;
                        // console.log("data__",data__);
                         selectElement.append($('<option>', {
                                    value: '',
                                    text: window.page.select_a_value
                                }
                            ));
                        $.each(data__, function (index, item) {
                            // console.log(item['colorknob_color'], selected_color_flag);
                                    // if (item['colorknob_color'] === selected_color_flag){
                                       
                                            selectElement.append($('<option>', {
                                                value: item[keys[0]],
                                                text: item[keys[0]]
                                            }
                                        ));
                                    // }//end if here
                        }); //end second each

                        // callback(data, step_number, element_names, keys);
                    } //end success here
            }); //end ajax call here
        }



        // if (decision === "no"){
        //     $("#form_btn").show();
        // }
        $("#form_btn").show();

    });


     function extra_fields(show_flag, data_id){
        if (show_flag === "Yes"){
            $(`div#create_order_form_step_${data_id} #keepflow_div_${data_id}`).show();
            $(`div#create_order_form_step_${data_id} #texture_div_${data_id}`).show();
            $(`div#create_order_form_step_${data_id} #upload_file_div_${data_id}`).show();
        }else{
             $(`div#create_order_form_step_${data_id} #keepflow_div_${data_id}`).hide();
            $(`div#create_order_form_step_${data_id} #texture_div_${data_id}`).hide();
            $(`div#create_order_form_step_${data_id} #upload_file_div_${data_id}`).hide();
        }
    }


    function getValuesForKey(key, list) {
        const values = [];
        list.forEach(obj => {
            const value = obj[key];
            if (value !== undefined) {
                values.push(value);
            }
        });
        return values;
    }


    $(document).on('change','.collection_barcode',function(){ //td
        $(this).css('pointer-events','none');
        let collectionbarcode = $(this).find(':selected').text();
        //console.log("collectionbarcode=",collectionbarcode)
        let data_id  = $(this).attr('data-id');
        

        //knobs_tracker.push({[$(`#collection_barcode_${data_id}`).find(':selected').val()]: mappedValue });
        let selectedValue = $(`#collection_${data_id}_order_item_knobfamily_bool`).val();
        var mappedValue = (selectedValue == 1) ? "yes" : "no";
        knobs_tracker.push({[collectionbarcode]: selectedValue });
        let data = start_tracking();
        // let selectedValue = $(`#collection_${data_id}_order_item_knobfamily_bool`).val();
        // var mappedValue = (selectedValue == 1) ? "yes" : "no";
        // if (value !== null && value.length > 0)
        //     knobs_tracker.push({[$(`#collection_barcode_${data_id}`).find(':selected').val()]: mappedValue });
        console.log("data=",data)
        let knob_decision = getValuesForKey(collectionbarcode, data);
        console.log("knob_decision=",knob_decision);
            if (knob_decision[0] == "no"){
                $(`table#order_table #knob_model_${data_id}`).find('optgroup').remove();
                $(`table#order_table .question_dependency_${data_id}`).hide();
                $(`table#order_table #fourth_td_label_${data_id}`).hide();
                $(`table#order_table #fifth_td_label_${data_id}`).hide();
            }
            else{                                     
                $(`table#order_table .question_dependency_${data_id}`).show();
                $(`table#order_table #fourth_td_label_${data_id}`).show();
                $(`table#order_table #fifth_td_label_${data_id}`).show();
            }
    });

     $(document).on('change','.knob_model_td',function(){ //td
        let data_id  = $(this).attr('data-id');
        $(`#knob_position_${data_id}`).removeClass('hide_');
        $(`#fifth_td_label_${data_id}`).removeClass('hide_');
        let value = $(this).find(":selected").val();
        if (value === window.page.without_knob)
        {
            $(`#knob_position_${data_id}`).empty().append('<option value=""></option>');
            $(`#knob_position_${data_id}`).addClass('hide_');
        }
    });


     function updateObjList(list, newObj) {
        let li_ = list;
        // Remove the object with the same id as the newObj
        li_ = li_.filter(item => item.id !== newObj.id);
        console.log(li_);
        // Add the new object to the list
        li_.push(newObj);
        
        return li_;
    }


     function deleteById(list, id_to_delete) {
        return list.filter(obj => obj.id !== id_to_delete);
    }
    
    function findById(list, id_to_find) {
        if (!Array.isArray(list)) {
            console.error("List is not an array.");
            return null;
        }

        const foundObj = list.find(obj => obj.id === id_to_find);
        return foundObj ? foundObj : null;
    }

    function findByIdAndRenameFirstKey(list, id_to_find, new_first_key) {
        const foundObj = list.find(obj => obj.id === id_to_find);
        if (foundObj) {
            const keys = Object.keys(foundObj);
            const firstKey = keys[0];
            foundObj[new_first_key] = foundObj[firstKey];
            delete foundObj[firstKey];
            return foundObj;
        } else {
            return null;
        }
    }

     $(document).on('change','select[name="collection_barcode[]"]', function(){

        let data_id = $(this).attr('data-id');
        
        let back =  $(this).find(":selected").data('back');
        let kant =  $(this).find(":selected").data('kant');
        let collectionbarcode = $(this).val();
        //[{'description3': 'yes', 'id': 3}, {'11027XM-46': 'no', 'id': 4}]
        // console.log(data_id);
        // keep_flow_tracker = updateOrPush(keep_flow_tracker, collectionbarcode, '');
        // console.log("keep_flow_tracker=",keep_flow_tracker);
        // let value = '';
        // if ($(`#collection_${data_id}_order_item_knobfamily_bool`).length > 0)
        //     value = $(`#collection_${data_id}_order_item_knobfamily_bool`).val() == 1 ? 'yes' : 'no';
        if (findById(knobs_tracker, parseInt(data_id))){
            console.log("exists");
            knobs_tracker = findByIdAndRenameFirstKey(knobs_tracker, parseInt(data_id), collectionbarcode);      
        }else{
             knobs_tracker.push(
                    {
                        [collectionbarcode]: '',
                        'id': parseInt(data_id),
                        'knob_family':'',
                        'knob_color':'',
                    }
            );
        }
        console.log("knobs_tracker=",knobs_tracker);


        // let newObj = {
        //     id: parseInt(data_id)
        // };
        // newObj[collectionbarcode] = value;
        // knobs_tracker = updateObjList(knobs_tracker, newObj);
        // console.log(knobs_tracker);

        let collection = $(this).find(":selected").data('collection');
        let description = $(this).find(":selected").data('description');
        let row =`<td class="p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300">
           ${collectionbarcode}
        </td>
        <td class="p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300">
            ${description}
        </td>
        <td class="p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300">
            ${back}
        </td>
        <td class="p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300">
            ${kant}
        </td>
         `;
        $(`#collection_table_row_${data_id}`).empty().append(row);
        // console.log(row);
        $(`#collection_table_${data_id}`).show();
        let selected_flow_flag  = $(this).find(':selected').attr('data-flow');
        extra_fields(selected_flow_flag, data_id);
        $(`#keepflow_question_${data_id}`).show();

    });

    // $(document).on('change','select[name="collection[]"]', function(){
    //     let data_id = $(this).attr('data-id');
    //     let selected_flow_flag  = $(this).find(':selected').attr('data-flow');
    //     extra_fields(selected_flow_flag, data_id);


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
    //     // console.log("selected_collection=",selected_collection);
    //     // $.ajax({
    //     //         url:$("#link_to_grab_order_page_data_").val(), // add url for posting request
    //     //         method:'POST',
    //     //         data:{
    //     //             data_requirement:'collection', 
    //     //         },
    //     //         dataType:'JSON',
    //     //         success:function(data){

    //     //             let elem_name = `div#create_order_form_step_${data_id} select[name='${element_names[0]}']`;
    //     //             var selectElement =  $(elem_name).empty();
    //     //             selectElement.append($('<option>', {
    //     //                     value: '',
    //     //                     text: 'select a value'
    //     //                 }
    //     //             ));
    //     //             let data_ = data.data;
    //     //             for (let i=0; i< data_.length; i++){
    //     //                 if (data_[i].description == selected_collection && data_[i].in_stock_bool == 1){ // check if it exists in stock or not
    //     //                     console.log(i, "Matched");
    //     //                     selectElement.append($('<option>', {
    //     //                             value: data_[i][keys[0]],
    //     //                             text: data_[i][keys[0]]
    //     //                         }
    //     //                     ));
    //     //                 }//end if here
    //     //             }//end for loop here
    //     //             // callback(data, step_number, element_names, keys);

    //     //         }
    //     // }); //end ajax call here    
        

        
    // });

     function show_hide_order_table(){
        var count__ = parseInt ($("#card_data_count").val())+1;
        let step_click_counter = parseInt($("#step_click_counter").val());
        let decision = $("#decision").val();
        let counter = parseInt ($("#add_collection_btn").data('id'));
        if (decision === "no"){

                        $("table#order_table tbody#order_table_tbody").append(generate_row(count__));
                        get_knob_family(populateRowData_KnobFamily, count__);
                        specific_knob_family(count__);

                        get_knob_position(populateRowData_KnobPosition, count__);
                        get_door_opening_sides(populateRowData_DoorSides, count__);
                        get_hinge_provider(populateRowData_HingeProvider, count__);
                        get_claps_pr_provider(populateRowData_clap_pr_provider, count__);

                        get_drawer_data(populateRowData_DrawarData, count__);
                        $("#create_order_form_step_6").show();
                        $("#send_order_btn").removeClass('hide_');

                             $("#send_order_data_to_draft").removeClass('hide_');
                        $("#preview_order_button").removeClass('hide_');
                
        }else{
                if (counter >= 4 && step_click_counter >=2){
                        // console.log("step_click_counter",step_click_counter);

                            $("table#order_table tbody#order_table_tbody").append(generate_row(count__));
                            // get_collection_data(populateRowData_Collection, 1);
                            get_knob_family(populateRowData_KnobFamily, count__);
                            specific_knob_family(count__);

                            get_knob_position(populateRowData_KnobPosition, count__);
                            get_door_opening_sides(populateRowData_DoorSides, count__);
                            get_hinge_provider(populateRowData_HingeProvider, count__);
                            get_claps_pr_provider(populateRowData_clap_pr_provider, count__);
                            get_drawer_data(populateRowData_DrawarData, count__);
                            $('table#order_table tbody td:first-child').removeClass('hide_');
                            $('table#order_table thead th:first-child').removeClass('hide_');
                            $("#create_order_form_step_6").show();
                            $("#send_order_btn").removeClass('hide_');
                             $("#send_order_data_to_draft").removeClass('hide_');
                            $("#preview_order_button").removeClass('hide_');
                        // }
                    }else{
                        $('table#order_table tbody td:first-child').addClass('hide_');
                        $('table#order_table thead th:first-child').addClass('hide_');
                    } 
        }
        if (parseInt($("#add_collection_btn").attr('data-id'))==6){
            $("#add_collection_btn").hide();
        }
    } // end show_hide_order_table function here



      $(document).on('change','input[name^="keep_flow_question"]',function() {

        var selectedValue = $(this).val();
        var convertedValue = selectedValue === "yes" ? 1 : 0;
        let data_id = $(this).attr('data-id');
        $(`#collection_${data_id}_order_item_knobfamily_bool`).val(convertedValue);
        // console.log(selectedValue);
        // if (convertedValue == 1)
        let collectionbarcode = $(`#collection_barcode_${data_id}`).find(':selected').val();
        let updates = {
            [$(`#collection_barcode_${data_id}`).find(':selected').val()]:selectedValue
        };
        if (selectedValue == "no"){
            updates = {
                        [$(`#collection_barcode_${data_id}`).find(':selected').val()]:selectedValue, 
                        'knob_family':'',
                        'knob_color':''

            };
        }

        knobs_tracker = updateKnobInfo(knobs_tracker, parseInt(data_id), updates);
        console.log("knobs_tracker=",knobs_tracker);

        // knobs_tracker.push({[$(`#collection_barcode_${data_id}`).find(':selected').val()]: selectedValue });
        // console.log("knobs_tracker=",knobs_tracker);
        
        // let value = '';
        // if ($(`#collection_${data_id}_order_item_knobfamily_bool`).length > 0)
        // convertedValue == 1 ? 'yes' : 'no';
        // let newObj = {
        //     id: parseInt(data_id)
        // };
        // newObj[collectionbarcode] = selectedValue;
        // knobs_tracker = updateObjList(knobs_tracker, newObj);
        // console.log("knobs_tracker=",knobs_tracker);

        if (selectedValue === "yes"){
            get_knob_family(handleKnobFamilyData, data_id, ["knob_family[]"], ["knob_family"]);
            $(`.knob_div_${data_id}`).show();
            $(".use_select2").select2();   
        }else{
            $(`.knob_div_${data_id}`).remove();
        }

        let decision = $("#decision").val();
        if (decision === "yes")
            $("#create_order_form_add_collection_div").show();
        else
            $("#create_order_form_add_collection_div").hide();

        
        // $(`.knob_div_${data_id}`).show();
        // $(".use_select2").select2();
        // $(`#keepflow_question_${data_id}`).remove();
        $('#keepflow_question_' + data_id).find('input[type="radio"]').removeAttr('name');
        $(`#keepflow_question_${data_id}`).css('pointer-events','none');
        // show or hide the order table which comes at the end
        show_hide_order_table();


    }); //end input[name="color_selection"] event here

    
    ///////////// end event on collection barcode field and collection name both fields are dependent each other
    
    // function tracker_mapper(){
        // let product_type = $("#product_type").val();
        // let decision_ = $("#decision").val();
        // let collection_counter = $("#add_collection_btn").data('id');
        // console.log(product_type, decision_,collection_counter ); 
        // if (collection_counter == 1 && decision_ =="no")
        //     start_tracking();
        // else if (collection_counter == 6 && decision_ =="yes")
        //     start_tracking();
    // }

   
    

    $(document).on('click','#add_collection_btn',function(){
        // $("#order_table_tbody").empty();
        $("#create_order_form_add_collection_div").hide();
        let next_count_div = $(this).attr('data-id');
        // console.log(next_count_div);
        
        $("#step_click_counter").val(parseInt($("#step_click_counter").val()) + 1);

        let decision = $("#decision").val();
        $(`#create_order_form_step_${next_count_div}`).empty().append(html_fields_generation(decision, next_count_div));
        
        // //get_collection(handleCollectionData, next_count_div, ["collection_barcode[]","collection[]"], ["collection_barcode","description"]);
        //console.log("Collection data is populated");
        /////////// start map logic for the collections which are already exists
        let keys = ["collection_barcode"];
        let element_names = ["collection_barcode[]"];
        let selected_collection = [];
        $(`select[name='collection_barcode[]']`).each(function() {
            let value = $(this).val();
            if (value !== null && value.length > 0)
                selected_collection.push(value);
        });


        //console.log("selected_collections are=",selected_collection); 
        let step_number = next_count_div;
         $.ajax({
                url:$("#link_to_grab_order_page_data_").val(), // add url for posting request
                method:'POST',
                data:{
                    data_requirement:'collection', 
                },
                dataType:'JSON',
                success:function(data){
                        $.each(keys, function(index, key){
                                // console.log(index, key);
                        let elem_name = `div#create_order_form_step_${step_number} select[name='${element_names[index]}']`;
                        // console.log(elem_name);
                        var selectElement =  $(elem_name).empty();
                         selectElement.append($('<option>', {
                                value: '',
                                text: window.page.select_a_value
                            }
                        ));

                        if (selectElement){
                                        $.each(data.data, function (index, item) {
                                            
                                            if (!selected_collection.includes(item[key])){
                                                    if (item.in_stock_bool == 1){
                                                        selectElement.append($('<option>', {
                                                                value: item[key],
                                                                text: item[key],
                                                                'data-flow':item['flow'],
                                                                'data-id':item['collection_id'],
                                                                'data-back':item['back'],
                                                                'data-kant':item['kant'],
                                                                'data-minorder':item['min_order'],
                                                                'data-collection':item['collection_name'],
                                                            }
                                                         ));
                                                    }
                                            }


                                    }); //end second each
                                }
                        }); // end  each loop

                } //end success here
        }); //end ajax call here
        
       
        /////////// end map logic for the collections which are already exists


        
        $(`#create_order_form_step_${next_count_div} select.use_select2`).select2();
        
        



        // get_knob_family(handleKnobFamilyData, next_count_div, ["knob_family[]","knob_color[]"], ["knob_family","knob_color"]);
         get_knob_family(handleKnobFamilyData, next_count_div, ["knob_family[]"], ["knob_family"]);
        
        $('table#order_table tbody td:first-child').removeClass('hide_');
        $('table#order_table thead th:first-child').removeClass('hide_');
        let already_generated_rows = parseInt($("#card_data_count").val());
        for (let i=already_generated_rows; i< $('table#order_table tbody tr').length;i++ )
            get_collection_data(populateRowData_Collection, i+1);

        let counter = parseInt(next_count_div)+1;

        $("#add_collection_btn").attr('data-id',counter);
        if (counter > 5)
            $("#create_order_form_add_collection_div").hide();
        // $().empty().append();
    });




    // $(document).on('click','#add_collection_btn',function(){
    //     let next_count_div = $(this).attr('data-id');
    //     // console.log(next_count_div);
        
    //     $("#step_click_counter").val(parseInt($("#step_click_counter").val()) + 1);

    //     let decision = $("#decision").val();
    //     $(`#create_order_form_step_${next_count_div}`).empty().append(html_fields_generation(decision, next_count_div));
    //     $(`#create_order_form_step_${next_count_div} select.use_select2`).select2();
    //     // get_collection(handleCollectionData, next_count_div, ["collection_barcode[]","collection[]"], ["collection_barcode","collection_name"]);
    //     get_collection(handleCollectionData, next_count_div, ["collection_barcode[]","collection[]"], ["collection_barcode","description"]);
    //     // get_knob_family(handleKnobFamilyData, next_count_div, ["knob_family[]","knob_color[]"], ["knob_family","knob_color"]);
    //     get_knob_family(handleKnobFamilyData, next_count_div, ["knob_family[]"], ["knob_family"]);
        
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


    




    function generate_row(tr_count){

            let class_name = "hide_";
            let counter = parseInt ($("#add_collection_btn").data('id'));
            if (counter > 4)
                class_name = "";
            let options = `<option value="" selected>${window.page.select_a_value}</option>`;
            $(`select[name='collection_barcode[]']`).each(function() {
                let value = $(this).val();
                let id = $(this).find(':selected').attr('data-id');
                if (value !== null && value.length > 0)
                    options+=`<option value="${id}">${value}</option>`;
            }); 
            return  `<tr id="ot_row_${tr_count}" class="bg-white border border-gray-300 dark:border-zink-50 dark:bg-zink-700">

                        <td id="zero_td_${tr_count}" scope="row" class="p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300 ${class_name}" >
                            <select class="col-span-12 sm:col-span-10 px-3 bg-white w-full border p-2 border-gray-400 rounded placeholder:text-sm focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700  dark:bg-zink-700 dark:border-zink-50 dark:text-zink-200 collection_barcode" name="collection_barcode_td[]" id="collection_barcode_td_${tr_count}" data-id="${tr_count}">
                                ${options}
                            </select>
                            <div class="" id="zero_td_label_${tr_count}"></div>
                        </td>



                        <td scope="row" class="p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300" id="first_td_${tr_count}">
                            


                            <input type="text" name="height[]" id="height_${tr_count}" class="w-full border py-1 p-2 placeholder:text-gray-600 rounded border-gray-400 placeholder:text-[11px] focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent dark:border-zink-50 dark:placeholder:text-zink-200" data-id="${tr_count}" required>
                            

                            <div class="" id="first_td_label_${tr_count}"></div>


                        </td>
                        <td class="p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300">
                            <input type="text" name="width[]" id="width_${tr_count}" class="w-full border py-1 p-2 placeholder:text-gray-600 rounded border-gray-400 placeholder:text-[11px] focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent dark:border-zink-50 dark:placeholder:text-zink-200" data-id="${tr_count}" required>
                            <div class="" id="second_td_label_${tr_count}"></div>
                        </td>
                        <td class="p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300">
                            <input type="text" name="quantity[]" id="quantity_${tr_count}" class="w-full border py-1 p-2 placeholder:text-gray-600 rounded border-gray-400 placeholder:text-[11px] focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent dark:border-zink-50 dark:placeholder:text-zink-200" min="1" data-id="${tr_count}" required>
                            <div class="" id="third_td_label_${tr_count}"></div>
                        </td>
                        <td class="p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300">
                            <select class="col-span-12 sm:col-span-10 px-3 bg-white w-full border p-2 border-gray-400 rounded placeholder:text-sm focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700  dark:bg-zink-700 dark:border-zink-50 dark:text-zink-200 knob_model_td" name="knob_model[]" id="knob_model_${tr_count}" data-id="${tr_count}" required>
                                    <option value="${window.page.without_knob}" selected>${window.page.without_knob}</option>
                            </select>
                            <div class="" id="fourth_td_label_${tr_count}"></div>
                        </td>

                        <td class="p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300">
                            <select class="col-span-12 sm:col-span-10 px-3 bg-white w-full border p-2 border-gray-400 rounded placeholder:text-sm focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700  dark:bg-zink-700 dark:border-zink-50 dark:text-zink-200 hide_" name="knob_position[]" id="knob_position_${tr_count}" data-id="${tr_count}">
                            </select>
                            <div class="hide_" id="fifth_td_label_${tr_count}"></div>
                        </td>

                        <td class="text-center p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300">
                            <button type="button" data-id="drills_${tr_count}" id="plus_hinge_btn_${tr_count}" class="subform_btn">
                            <i class="fa fa-plus"></i></button>
                            ${subform_generation(tr_count)}
                        </td>

                        <td class="text-center p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300">
                            <button type="button" data-id="drills_${tr_count}_notes" class="subform_btn" ><i class="fa fa-plus"></i></button>
                            ${notes_form_generation(tr_count)}
                        </td>


                        <td class="text-center p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300">
                            <button class="delete_btn" type="button" name="delete_button[]" data-id="${tr_count}"><i class="fa fa-trash"></i></button>
                        </td>
                    </tr>`;
    } //end generate_row here



     function generate_row_edit(tr_count , obj){
            
            let font_style = 'font-size:20px';
            let class_name = "hide_";
            let counter = parseInt ($("#add_collection_btn").data('id'));
            if (counter > 4)
                class_name = "";
            let btn_class  = `subform_btn text-white transition-all duration-300 ease-linear bg-green-500 border-green-500 rounded-full hover:bg-green-600 hover:border-green-600 hover:text-white active:bg-green-600 active:border-green-600 active:text-white focus:bg-green-600 focus:border-green-600 focus:text-white focus:ring focus:ring-green-500/30 btn`;
            let icon_class=`bx bx-check-shield`;
            let form1 = subform_generation_edit(tr_count, obj);
            let form2 = notes_form_generation_edit(tr_count, obj);

            if (obj.card_drawer_length==0  && obj.card_clap_length==0 && obj.card_hinge_length == 0){
                form1 = subform_generation(tr_count, obj);
                form2 = notes_form_generation(tr_count, obj);
                icon_class = "fa fa-plus";
                btn_class  = `subform_btn`;
                font_style= '';
            }

            return  `<tr id="ot_row_${tr_count}" class="bg-white border border-gray-300 dark:border-zink-50 dark:bg-zink-700">

                        <td id="zero_td_${tr_count}" scope="row" class="p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300 ${class_name}" >
                            <select class="col-span-12 sm:col-span-10 px-3 bg-white w-full border p-2 border-gray-400 rounded placeholder:text-sm focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700  dark:bg-zink-700 dark:border-zink-50 dark:text-zink-200 collection_barcode"  name="collection_barcode_td[]" id="collection_barcode_td_${tr_count}" data-id="${tr_count}">
                            </select>
                            <div class="" id="zero_td_label_${tr_count}"></div>
                        </td>



                        <td scope="row" class="p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300" id="first_td_${tr_count}">
                            


                            <input type="text" name="height[]" id="height_${tr_count}" class="w-full border py-1 p-2 placeholder:text-gray-600 rounded border-gray-400 placeholder:text-[11px] focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent dark:border-zink-50 dark:placeholder:text-zink-200" data-id="${tr_count}" required value=${obj.card_height}>
                            

                            <div class="" id="first_td_label_${tr_count}"></div>


                        </td>
                        <td class="p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300">
                            <input type="text" name="width[]" id="width_${tr_count}" class="w-full border py-1 p-2 placeholder:text-gray-600 rounded border-gray-400 placeholder:text-[11px] focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent dark:border-zink-50 dark:placeholder:text-zink-200" data-id="${tr_count}" required value=${obj.card_width}>
                            <div class="" id="second_td_label_${tr_count}"></div>
                        </td>
                        <td class="p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300">
                            <input type="text" name="quantity[]" id="quantity_${tr_count}" class="w-full border py-1 p-2 placeholder:text-gray-600 rounded border-gray-400 placeholder:text-[11px] focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700 dark:bg-transparent dark:border-zink-50 dark:placeholder:text-zink-200" min="1" data-id="${tr_count}" required value=${obj.card_quantity}>
                            <div class="" id="third_td_label_${tr_count}"></div>
                        </td>
                        <td class="p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300">
                            <select class="col-span-12 sm:col-span-10 px-3 bg-white w-full border p-2 border-gray-400 rounded placeholder:text-sm focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700  dark:bg-zink-700 dark:border-zink-50 dark:text-zink-200 knob_model_td" name="knob_model[]" id="knob_model_${tr_count}" data-id="${tr_count}" required>
                                 <option value="${window.page.without_knob}" selected>${window.page.without_knob}</option>
                            </select>
                            <div class="" id="fourth_td_label_${tr_count}"></div>
                        </td>

                        <td class="p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300">
                            <select class="col-span-12 sm:col-span-10 px-3 bg-white w-full border p-2 border-gray-400 rounded placeholder:text-sm focus:border focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-700  dark:bg-zink-700 dark:border-zink-50 dark:text-zink-200 hide_" name="knob_position[]" id="knob_position_${tr_count}" data-id="${tr_count}">
                            </select>
                            <div class="hide_" id="fifth_td_label_${tr_count}"></div>
                        </td>

                        <td class="text-center p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300">
                            <button type="button" data-id="drills_${tr_count}" class="${btn_class}" style="${font_style}">
                            <i class="${icon_class}"></i></button>
                            ${form1}
                        </td>

                        <td class="text-center p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300">
                            <button type="button" data-id="drills_${tr_count}_notes" class="subform_btn"><i class="fa fa-plus"></i></button>
                            ${form2}
                        </td>


                        <td class="text-center p-3 text-gray-700 font-normal whitespace-nowrap dark:text-zink-200 border-l dark:border-zink-50 border-gray-300">
                            <button class="delete_btn" type="button" name="delete_button[]" data-id="${tr_count}"><i class="fa fa-trash"></i></button>
                        </td>
                    </tr>`;
    } //end generate_row here


    function get_knob_position(callback, row_count){
        $.ajax({
                url:$("#link_to_grab_order_page_data_").val(), // add url for posting request
                method:'POST',
                data:{
                    data_requirement:'knob_position', 
                },
                dataType:'JSON',
                success:function(data){
                    callback(data, row_count);
                }
        }); //end ajax call here
       
    } //end get_knob_position func here

    function get_door_opening_sides(callback, row_count){
        $.ajax({
                url:$("#link_to_grab_order_page_data_").val(), // add url for posting request
                method:'POST',
                data:{
                    data_requirement:'door_opening_side', 
                },
                dataType:'JSON',
                success:function(data){
                    callback(data, row_count);
                }
        }); //end ajax call here
       
    } //end get_knob_position func here


    function get_claps_pr_provider(callback, row_count){
        $.ajax({
                url:$("#link_to_grab_order_page_data_").val(), // add url for posting request
                method:'POST',
                data:{
                    data_requirement:'claps_pr_order', 
                },
                dataType:'JSON',
                success:function(data){
                    callback(data, row_count);
                }
        }); //end ajax call here
       
    } //end get_knob_position func here

     function get_hinge_provider(callback, row_count){
        $.ajax({
                url:$("#link_to_grab_order_page_data_").val(), // add url for posting request
                method:'POST',
                data:{
                    data_requirement:'hinge_provider', 
                },
                dataType:'JSON',
                success:function(data){
                    callback(data, row_count);
                }
        }); //end ajax call here
       
    } //end get_knob_position func here

    function get_drawer_data(callback, row_count){
        $.ajax({
                url:$("#link_to_grab_order_page_data_").val(), // add url for posting request
                method:'POST',
                data:{
                    data_requirement:'drawer', 
                },
                dataType:'JSON',
                success:function(data){
                    callback(data, row_count);
                }
        }); //end ajax call here
       
    } //end get_drawer_data func here

    function get_collection_data(callback, row_count){
        $.ajax({
                url:$("#link_to_grab_order_page_data_").val(), // add url for posting request
                method:'POST',
                data:{
                    data_requirement:'collection', 
                },
                dataType:'JSON',
                success:function(data){
                    callback(data, row_count);
                }
        }); //end ajax call here
       
    } //end get_collection func here



    function mapping_knob_models(response, selectElement){
        var opt = $("<option>").text(window.page.without_knob).val(window.page.without_knob);
        opt.attr('selected', 'selected');
        opt.appendTo(selectElement);
        let decision = $("#decision").val();
        //if (decision !== "no"){
        console.log("Line#2668");
        console.log(response.data);
             $.each(response.data, function(label, options) {
                    if (options.length>0){
                        var optgroup = $("<optgroup>").attr("label", label);
                        $.each(options, function(index, option) {
                            $("<option>").text(option).val(option).appendTo(optgroup);
                        });
                        
                        // Append the optgroup to the select element
                        optgroup.appendTo(selectElement);
                }
            });
        //}
            // selectElement.select2();
    }

   



    function mapping_knob_models_edit(response, selectElement,obj){
        console.log("At mapping_knob_models_edit func_:",obj);
        // if (obj.knob_position_id == obj.knob_model && obj.knob_position_id.length==0){
            
        // }
        var opt = $("<option>").text(window.page.without_knob).val(window.page.without_knob);
        opt.appendTo(selectElement);
        // let decision = $("#decision").val();
       // if (decision !== "no"){
            let match = false;
                $.each(response.data, function(label, options) {
                    // Create an <optgroup> element
                    var optgroup = $("<optgroup>").attr("label", label);
                    console.log("options=",options);
                    $.each(options, function(index, option) {
                         let $option = $("<option>").text(option).val(option);
                         console.log(index, "Ok matched", option,obj.knob_model );
                          if (option === obj.knob_model) {
                                match = true;
                                $option.prop("selected", true); // Set selected attribute
                            }
                        $option.appendTo(optgroup);
                        // $("<option>").text(option).val(option).appendTo(optgroup);
                    });
                    
                    // Append the optgroup to the select element
                    optgroup.appendTo(selectElement);
                });
            
            if (!match){
                opt.attr('selected', 'selected');
            }
            
                // selectElement.select2();
        //}
    }


    function specific_knob_family(row_count){


            let all_families = []; // Initialize an empty array to store the values
            let index = 3;
            $("select[name='knob_family[]']").each(function() {
                const isHidden = $(`.knob_div_${index}`).css("display") === "none";
                if (!isHidden) 
                    all_families.push($(this).val());
                index+=1;
            });



            // console.log(all_families);
        $.ajax({
                url:$("#link_to_grab_order_page_data_").val(), // add url for posting request
                method:'POST',
                data:{
                    data_requirement:'specific_knob_family', 
                    knob_family:all_families
                },
                dataType:'JSON',
                success:function(data){
                    // console.log(data);
                    mapping_knob_models(data, $(`#knob_model_${row_count}`).empty());
                    // callback(data, row_count);
                }
        }); //end ajax call here
       
    } //end specific_knob_family func here




     function specific_knob_family_edit(row_count, obj){
            console.log("At specific_knob_family_edit func_:",obj);
            
            let index = 3;
            let all_families = []; // Initialize an empty array to store the values
            $("select[name='knob_family[]']").each(function() {
                
                const isHidden = $(`.knob_div_${index}`).css("display") === "none";
                if (!isHidden) 
                    all_families.push($(this).val());
                index+=1;
            });
            console.log("all_families=",all_families);
            $.ajax({
                    url:$("#link_to_grab_order_page_data_").val(), // add url for posting request
                    method:'POST',
                    data:{
                        data_requirement:'specific_knob_family', 
                        knob_family:all_families
                    },
                    dataType:'JSON',
                    success:function(data){
                        console.log("specific_knob_family_edit Sucess data==>",data);
                        console.log("obj=",obj);
                        mapping_knob_models_edit(data, $(`#knob_model_${row_count}`).empty(), obj);
                        // callback(data, row_count);
                    }
            }); //end ajax call here
       
    } //end specific_knob_family func here



    // for row data rendering
    function populateRowData_KnobFamily(KnobFamilyData, row_count){
        
        var target_elems = [`knob_model_${row_count}`]

        $.each(KnobFamilyData.data, function (index, item) {
                                
                $(`#${target_elems[0]}`).append($('<option>', {
                                        text: item.knob_model,
                                        value: item.knob_id
                    }
                ));
        }); //end second each
    } //ends populateRowData here


    // function populateRowData_KnobPosition(KnobPositionData, row_count){
    //     var target_elems = [`knob_position_${row_count}`];
    //     $.each(KnobPositionData.data, function (index, item) {
    //         $(`#${target_elems[0]}`).append($('<option>', {
    //                     text: item.helper_value_hebrew,
    //                     value: item.helper_table_id
    //                 }
    //         ));
    //     }); //end second each

    // } //end populateRowData_KnobPosition here


    function populateRowData_KnobPosition(KnobPositionData, row_count){
        var target_elems = [`knob_position_${row_count}`];
        const customOrder = [6, 7, 8, 4, 5];
        // Sorting the data based on the custom order
        let data = KnobPositionData.data.sort((a, b) => customOrder.indexOf(a.helper_table_id) - customOrder.indexOf(b.helper_table_id));

        $.each(data, function (index, item) {
            $(`#${target_elems[0]}`).append($('<option>', {
                        text: item.helper_value_hebrew,
                        value: item.helper_table_id
                    }
            ));
        }); //end second each

    } //end populateRowData_KnobPosition here


     function populateRowData_DoorSides(DoorSidesData, row_count){
        
        var target_elems = [`door_operning_side_${row_count}`];

        $.each(DoorSidesData.data, function (index, item) {
                                
                $(`#${target_elems[0]}`).append($('<option>', {
                        text: item.helper_value_hebrew,
                        value: item.helper_value_hebrew
                    }
                ));
        }); //end second each
    } //ends DoorSidesData here


    function populateRowData_HingeProvider(DoorSidesData, row_count){
        
        var target_elems = [`hinge_provider_${row_count}`];

        $.each(DoorSidesData.data, function (index, item) {
                                
                $(`#${target_elems[0]}`).append($('<option>', {
                        text: item.helper_value_hebrew,
                        value: item.helper_value_hebrew
                    }
                ));
        }); //end second each
    } //ends populateRowData_HingeProvider here


    function populateRowData_Collection(CollectionData, row_count){
        // console.log("I am working");
        var target_elems = [`collection_barcode_td_${row_count}`];
        //$(`#${target_elems[0]}`).empty();
        // console.log("I am here line 2529");
        $(`#${target_elems[0]}`).empty().append($('<option>', {
                text: window.page.select_a_value,
                value: '', // Set value to empty if not needed
                // disabled: true, // Make it disabled if needed
                selected: true // Make it selected by default
        }));
        

        
        $.each(CollectionData.data, function (index, item) {
                                
                $(`#${target_elems[0]}`).append($('<option>', {
                        text: item.collection_barcode,
                        value: item.collection_id
                    }
                ));
        }); //end second each
    } //ends populateRowData_HingeProvider here
    

    // get_collection_data


     function populateRowData_clap_pr_provider(ClapPrOrderData, row_count){
        
        var target_elems = [`clap_pr_${row_count}`];

        $.each(ClapPrOrderData.data, function (index, item) {
                                
                $(`#${target_elems[0]}`).append($('<option>', {
                        text: item.helper_value_english,
                        value: item.helper_value_english
                    }
                ));
        }); //end second each
    } //ends populateRowData_HingeProvider here

    function populateRowData_DrawarData(Data, row_count){
            
        var target_elems = [`drawers_type_${row_count}`,`drawers_code_${row_count}`];
         $(`#${target_elems[0]}`).append($('<option>', {
                text: window.page.select_a_value,
                value: '', // Set value to empty if not needed
                disabled: true, // Make it disabled if needed
                selected: true // Make it selected by default
            }));

            $(`#${target_elems[1]}`).append($('<option>', {
                text: window.page.select_a_value,
                value: '', // Set value to empty if not needed
                disabled: true, // Make it disabled if needed
                selected: true // Make it selected by default
            }));




        $.each(Data.data, function (index, item) {
                                
                $(`#${target_elems[0]}`).append($('<option>', {
                        text: item.drawer_type,
                        value: item.drawer_type,
                       
                    }
                ));

                $(`#${target_elems[1]}`).append($('<option>', {
                        text: item.drawer_code,
                        value: item.drawer_code,
                       
                    }
                ));

        }); //end second each

    } //end populateRowData_DrawarData func  here

    // append first row
    

    // new mapping based on drawers_type
    // $('#order_table_tbody').on('change','select[name="drawers_type"]',function(){
    //     let drawers_type = $(this).find(":selected").val();
    //     let drawers_code = $(this).find(":selected").data('drawercode');
    //     let element_id = $(this).attr('id').replace('type','code');
    
    //     // Filter options based on the desired value
    //     var matchingOptions = $(`select#${element_id} option`).filter(function() {
    //         return $(this).val() === drawers_code;
    //     });

    //     if (matchingOptions.length > 0) {
    //         // If at least one matching option is found, show it and hide others
    //         // matchingOptions.show().prop('selected', false).siblings().hide();
    //         matchingOptions.show().siblings().hide();
    //     } else {
    //         // If no matching options are found, hide all options
    //         $(`select#${element_id} option`).hide();
    //     }

    //     $(`#${element_id}`).prepend($('<option>', {
    //         text: 'Select a value',
    //         value: '', // Set value to empty if not needed
    //         disabled: true, // Make it disabled if needed
    //         selected: true // Make it selected by default
    //     }));

    // }); //end select[name="drawers_type"] event here
     $('#order_table_tbody').on('change','select[name="drawers_type"]',function(){
        let drawer_type = $(this).find(":selected").val();
        let element_id = $(this).attr('id').replace('type','code');
        $.ajax({
                url:$("#link_to_grab_order_page_data_").val(), // add url for posting request
                method:'POST',
                data:{
                    data_requirement:'get_specific_drawer_codes', 
                    drawer_type:drawer_type
                },
                dataType:'JSON',
                success:function(data){

                    $(`select#${element_id}`).empty().append($('<option>', {
                            text: window.page.select_a_value,
                            value: '', // Set value to empty if not needed
                            disabled: true, // Make it disabled if needed
                            selected: true // Make it selected by default
                        }));
                    

                    $.each(data.data, function (index, item) {
                        $(`select#${element_id}`).append($('<option>', {
                            text: item.drawer_code,
                            value: item.drawer_code,   
                               
                         }));

                   });
                }//end success here
        }); //end ajax call here
    }); //end select[name="drawers_type"] event here


    ///////////////////////////// EDIT STUFF 

     function get_knob_position_edit(callback, row_count, obj){
        $.ajax({
                url:$("#link_to_grab_order_page_data_").val(), // add url for posting request
                method:'POST',
                data:{
                    data_requirement:'knob_position', 
                },
                dataType:'JSON',
                success:function(data){
                    callback(data, row_count, obj);
                }
        }); //end ajax call here
       
    } //end get_knob_position func here

    function get_door_opening_sides_edit(callback, row_count, obj){
        $.ajax({
                url:$("#link_to_grab_order_page_data_").val(), // add url for posting request
                method:'POST',
                data:{
                    data_requirement:'door_opening_side', 
                },
                dataType:'JSON',
                success:function(data){
                    callback(data, row_count, obj);
                }
        }); //end ajax call here
       
    } //end get_knob_position func here


    function get_claps_pr_provider_edit(callback, row_count, obj){
        $.ajax({
                url:$("#link_to_grab_order_page_data_").val(), // add url for posting request
                method:'POST',
                data:{
                    data_requirement:'claps_pr_order', 
                },
                dataType:'JSON',
                success:function(data){
                    callback(data, row_count, obj);
                }
        }); //end ajax call here
       
    } //end get_knob_position func here

     function get_hinge_provider_edit(callback, row_count, obj){
        $.ajax({
                url:$("#link_to_grab_order_page_data_").val(), // add url for posting request
                method:'POST',
                data:{
                    data_requirement:'hinge_provider', 
                },
                dataType:'JSON',
                success:function(data){
                    callback(data, row_count, obj);
                }
        }); //end ajax call here
       
    } //end get_knob_position func here

    function get_drawer_data_edit(callback, row_count, obj){
        console.log("inside get_drawer_data_edit function at line#3118", row_count);
        if (obj.card_drawer_length > 0){
            $.ajax({
                    url:$("#link_to_grab_order_page_data_").val(), // add url for posting request
                    method:'POST',
                    data:{
                        data_requirement:'specific_drawer', 
                        drawer_type:obj.card_drawer[0].drawar_order_type,
                    },
                    dataType:'JSON',
                    success:function(data){
                        //console.log(row_count, data, obj.card_drawer[0].drawar_order_type);
                        callback(data, row_count, obj);
                    }
            }); //end ajax call here
        }
       
    } //end get_drawer_data func here

    function get_collection_data_edit(callback, row_count, obj){
        $.ajax({
                url:$("#link_to_grab_order_page_data_").val(), // add url for posting request
                method:'POST',
                data:{
                    data_requirement:'collection', 
                },
                dataType:'JSON',
                success:function(data){
                    callback(data, row_count, obj);
                }
        }); //end ajax call here
       
    } //end get_collection func here



    function populateRowData_KnobFamilyEdit(KnobFamilyData, row_count, obj){
        // console.log("obj",obj);
        var target_elems = [`knob_model_${row_count}`]

        $.each(KnobFamilyData.data, function (index, item) {
                                
                // $(`#${target_elems[0]}`).append($('<option>', {
                //         text: item.knob_model,
                //         value: item.knob_id
                //     }
                // ));

                var option = $('<option>', {
                        text: item.knob_model,
                        value: item.knob_id
                });

                if (obj.knob == item.knob_id) {
                         option = $('<option>', {
                                text: item.knob_model,
                                value: item.knob_id,
                                selected:true,
                        });
            }
            $(`#${target_elems[0]}`).append(option);
        }); //end second each
        // var selectElement = $(target_elems[0]).empty()
        // $.each(KnobFamilyData.data, function(label, options) {
        //         // Create an <optgroup> element
        //         var optgroup = $("<optgroup>").attr("label", label);
                
        //         // Loop through the options for the current label
        //         $.each(options, function(index, option) {
        //             console.log("option",option);
        //             // Create an <option> element and append it to the optgroup
        //             $("<option>").text(option).val(option).appendTo(optgroup);
        //         });
                
        //         // Append the optgroup to the select element
        //         optgroup.appendTo(selectElement);
        // });

        //mapping_knob_models(KnobFamilyData.data, $(`#knob_model_${row_count}`).empty());

    } //ends populateRowDataEdit here


    function populateRowData_KnobPositionEdit(KnobPositionData, row_count, obj){
        var target_elems = [`knob_position_${row_count}`];

        $.each(KnobPositionData.data, function (index, item) {
            var option = $('<option>', {
                text: item.helper_value_hebrew,
                value: item.helper_table_id
            });

            if (obj.knob_position_id == item.helper_table_id) {
                 option = $('<option>', {
                    text: item.helper_value_hebrew,
                    value: item.helper_table_id,
                    selected:true,
                });
            }
            $(`#${target_elems[0]}`).append(option);

        }); //end second each

    } //end populateRowData_KnobPositionEdit here


     function populateRowData_DoorSidesEdit(DoorSidesData, row_count, obj){
        
        var target_elems = [`door_operning_side_${row_count}`];
        //console.log("Line 1822",obj);
        $.each(DoorSidesData.data, function (index, item) {
                                    
                var option = $('<option>', {
                    text: item.helper_value_hebrew,
                    value:item.helper_table_id
                });

                if (obj.card_hinge_length > 0){
                    if (obj.card_hinge[0].hinge_order_door_opening_side == item.helper_value_hebrew) {
                             option = $('<option>', {
                                text: item.helper_value_hebrew,
                                value: item.helper_table_id,
                                selected:true,
                            });
                    }
                }
                $(`#${target_elems[0]}`).append(option);
                
        }); //end second each
    } //ends DoorSidesData here


    function populateRowData_HingeProviderEdit(DoorSidesData, row_count, obj){
        
        var target_elems = [`hinge_provider_${row_count}`];

        $.each(DoorSidesData.data, function (index, item) {
                                
                // $(`#${target_elems[0]}`).append($('<option>', {
                //         text: item.helper_value_hebrew,
                //         value: item.helper_value_hebrew
                //     }
                // ));


                var option = $('<option>', {
                    text: item.helper_value_hebrew,
                    value: item.helper_value_hebrew
                });
                if (obj.card_hinge_length > 0){
                    if (obj.card_hinge[0].hinge_order_provider == item.helper_value_hebrew) {
                             option = $('<option>', {
                                text: item.helper_value_hebrew,
                                value: item.helper_value_hebrew,
                                selected:true,
                            });
                    }
                }

                $(`#${target_elems[0]}`).append(option);

        }); //end second each
    } //ends populateRowData_HingeProviderEdit here


    function populateRowData_CollectionEdit(CollectionData, row_count, obj){
        console.log("I am working");
        var target_elems = [`collection_barcode_td_${row_count}`];
        
        let options = '';
        let used_ids = [];
        let barcodes = [];
        $(`select[name='collection_barcode[]']`).each(function() {
                let value = $(this).val();
                let id = $(this).find(':selected').attr('data-id');
                if (value !== null && value.length > 0){
                    used_ids.push(parseInt(id));
                    barcodes.push(value);
                }
        }); 

        for (let i =0; i< used_ids.length; i++){

            let id__ = used_ids[i];
            let barcode__ = barcodes[i];
            let opt = '';
            if (parseInt(obj.collection_barcode_id) === id__){
                 opt = $('<option>', {
                    text: barcode__,
                    value: id__,
                    selected:true,
                });
            }else{
                opt = $('<option>', {
                    text: barcode__,
                    value: id__,
                   
                });
            }
            $(`#${target_elems[0]}`).append(opt);

        } //end for loop here
        // $(`#${target_elems[0]}`).attr('disabled', true);
        $(`#${target_elems[0]}`).css('pointer-events', 'none');

        // $.each(CollectionData.data, function (index, item) {
                // collection_barcode_id 
                // var option = '';    
                // if (used_ids.includes(parseInt(item.collection_id)))   {        
                //     option = $('<option>', {
                //         text: item.collection_barcode,
                //         value: item.collection_id
                //     });

                //     if (parseInt(item.collection_id) == parseInt(obj.collection_barcode_id)){
                //         option = $('<option>', {
                //             text: item.collection_barcode,
                //             value: item.collection_id,
                //             selected:true
                //         });
                //     }

                //     $(`#${target_elems[0]}`).append(option);
                // }

        // }); //end second each




    } //ends populateRowData_CollectionEdit here
    

    // get_collection_data


     function populateRowData_clap_pr_providerEdit(ClapPrOrderData, row_count, obj){
        
        var target_elems = [`clap_pr_${row_count}`];

        $.each(ClapPrOrderData.data, function (index, item) {
                
                var option = $('<option>', {
                    text: item.helper_value_english,
                    value: item.helper_value_english
                });

                if (obj.card_clap_length > 0){
                    if (obj.card_clap[0].clap_claps_pr == item.helper_value_english){
                        option = $('<option>', {
                            text: item.helper_value_english,
                            value: item.helper_value_english,
                            selected:true,
                        });
                    }
                }

                $(`#${target_elems[0]}`).append(option);
        }); //end second each
    } //ends populateRowData_clap_pr_providerEdit here

    function populateRowData_DrawarDataEdit(Data, row_count, obj){
        // console.log("I am in populateRowData_DrawarDataEdit func line 3375");
        var target_elems = [`drawers_type_${row_count}`,`drawers_code_${row_count}`];
        // console.log("populateRowData_DrawarDataEdit=>",Data.data);
        console.log("obj=>",obj, row_count);
        $.each(Data.data.all_drawers, function (index, item) {
                

                if (obj.card_drawer_length > 0 ){

                        var option1 = $('<option>', {
                            text: item.drawer_type,
                            value: item.drawer_type,  
                            'data-drawercode':item.drawer_code,  
                            selected:false, 
                        });
                        // var option2 = "";
                        // var option2 = $('<option>', {
                        //     text: item.drawer_code,
                        //     value: item.drawer_code,
                        //     'data-drawertype':item.drawer_type,
                                   
                        // });


                        if (item.drawer_type == obj.card_drawer[0].drawar_order_type){

                                option1 = $('<option>', {
                                    text: item.drawer_type,
                                    value: item.drawer_type,
                                    'data-drawercode':item.drawer_code,  
                                    selected:true,
                                });
                        }

                        // if ( obj.card_drawer[0].drawar_order_type == item.drawer_type){
                        //     option2 = $('<option>', {
                        //         text: item.drawer_code,
                        //         value: item.drawer_code,
                        //         'data-drawertype':item.drawer_type,
                        //         selected:false,
                        //     });


                        //     if (obj.card_drawer[0].drawer_code == item.drawer_code) {
                        //         option2 = $('<option>', {
                        //             text: item.drawer_code,
                        //             value: item.drawer_code,
                        //             'data-drawertype':item.drawer_type,
                        //             selected:true,
                        //         });
                        //     }



                        }

                            
                            // option2 = option2.hide();

                // }



                $(`#${target_elems[0]}`).append(option1);
                // $(`#${target_elems[1]}`).append(option2);

        }); //end second each



        $.each(Data.data.selected_codes, function (index, item) {
                    console.log("I am here at line 3448", item, obj);
                    

                    if (obj.card_drawer_length > 0 ){
                        // console.log("at 2453");
                        // console.log(obj.card_drawer[parseInt(row_count) - 1]);
                            var option2 = "";
                             if (item.drawer_code  == obj.card_drawer[0].drawar_order_code ) {
                                console.log("M 3457");
                                option2 = $('<option>', {
                                    text: item.drawer_code,
                                    value: item.drawer_code,
                                    'data-drawertype':obj.card_drawer[0].drawar_order_type,
                                    selected:true,
                                });
                                $(`#${target_elems[1]}`).append(option2);
                            }else{
                               option2 = $('<option>', {
                                    text: item.drawer_code,
                                    value: item.drawer_code,
                                    'data-drawertype':obj.card_drawer[0].drawar_order_type,
                                          selected:false,   
                                });
                               $(`#${target_elems[1]}`).append(option2);
                            }
                            

                        }



        });

    } //end populateRowData_DrawarData func  here








    //////////////////////////////

    
    
    $(document).on('click','#send_order_data_to_draft', function(){
        save_to_draft();
        
        Swal.fire(
                                        {
                                            title: window.page.good_job_title, 
                                        text: $("#draft_text").val(),
                                            icon: 'success',
                                            showConfirmButton: false,
                                            timer: 5000
                                        }
                                );
        console.log("Order data has been stored to Draft");
    });


    $(document).on('change','.knob_color_selection', function(e){
       

        let add_another_collection_count = parseInt($(this).attr('data-id'));
        let step_click_counter = parseInt($("#step_click_counter").val());
        let decision = $("#decision").val();
        console.log("Step=", add_another_collection_count);
        console.log("step_click_counter=", step_click_counter);
        let mapper_counter = add_another_collection_count + 2;
        if (add_another_collection_count  === step_click_counter){
                e.preventDefault(); 
                let val = $(this).val();
                let val2 = $(`#create_order_form_step_${mapper_counter} select[name="knob_family[]"]`).val();
                if (val != '' && val2 != ''){
                    if (decision === "no"){
                        $("table#order_table tbody#order_table_tbody").empty().append(generate_row(1));
                        get_knob_family(populateRowData_KnobFamily, 1);
                        specific_knob_family(1);

                        get_knob_position(populateRowData_KnobPosition, 1);
                        get_door_opening_sides(populateRowData_DoorSides, 1);
                        get_hinge_provider(populateRowData_HingeProvider, 1);
                        get_claps_pr_provider(populateRowData_clap_pr_provider, 1);
                        get_drawer_data(populateRowData_DrawarData, 1);
                        $("#create_order_form_step_6").show();
                        $("#send_order_btn").removeClass('hide_');
                          $("#send_order_data_to_draft").removeClass('hide_');
                    }
                    let counter = parseInt ($("#add_collection_btn").data('id'));
                    
                    if (decision === "yes" && counter >= 4 && step_click_counter >=2){
                        // console.log("step_click_counter",step_click_counter);

                            $("table#order_table tbody#order_table_tbody").empty().append(generate_row(1));
                            // get_collection_data(populateRowData_Collection, 1);
                            get_knob_family(populateRowData_KnobFamily, 1);
                            specific_knob_family(1);

                            get_knob_position(populateRowData_KnobPosition, 1);
                            get_door_opening_sides(populateRowData_DoorSides, 1);
                            get_hinge_provider(populateRowData_HingeProvider, 1);
                            get_claps_pr_provider(populateRowData_clap_pr_provider, 1);
                            get_drawer_data(populateRowData_DrawarData, 1);
                            $('table#order_table tbody td:first-child').removeClass('hide_');
                            $('table#order_table thead th:first-child').removeClass('hide_');
                            $("#create_order_form_step_6").show();
                            $("#send_order_btn").removeClass('hide_');

                             $("#send_order_data_to_draft").removeClass('hide_');
                        // }
                    }else{
                        $('table#order_table tbody td:first-child').addClass('hide_');
                        $('table#order_table thead th:first-child').addClass('hide_');
                    }   
                }
                else 
                    $("#create_order_form_step_6").hide();
        }
            return false;
    });

    // $(document).on('change','.knob_color_selection', function(e){
       

    //     let add_another_collection_count = parseInt($(this).attr('data-id'));
    //     let step_click_counter = parseInt($("#step_click_counter").val());

    //     console.log("Step=", add_another_collection_count);
    //     console.log("step_click_counter=", step_click_counter);
    //     let mapper_counter = add_another_collection_count + 2;
    //     if (add_another_collection_count  === step_click_counter){
    //             e.preventDefault(); 
    //             let val = $(this).val();
    //             let val2 = $(`#create_order_form_step_${mapper_counter} select[name="knob_family[]"]`).val();
    //             if (val != '' && val2 != ''){
                    
    //                 $("table#order_table tbody#order_table_tbody").empty().append(generate_row(1));
    //                 get_knob_family(populateRowData_KnobFamily, 1);
    //                 get_knob_position(populateRowData_KnobPosition, 1);
    //                 get_door_opening_sides(populateRowData_DoorSides, 1);
    //                 get_hinge_provider(populateRowData_HingeProvider, 1);
    //                 get_claps_pr_provider(populateRowData_clap_pr_provider, 1);
    //                 get_drawer_data(populateRowData_DrawarData, 1);

                    
    //                 $("#create_order_form_step_6").show();
    //                 $("#send_order_btn").removeClass('hide_');

    //                 let decision = $("#decision").val();
    //                 let counter = parseInt ($("#add_collection_btn").data('id'));

    //                 if (decision === "yes" && counter > 4){
    //                     get_collection_data(populateRowData_Collection, 1);
    //                     $('table#order_table tbody td:first-child').removeClass('hide_');
    //                     $('table#order_table thead th:first-child').removeClass('hide_');
    //                 }else{
    //                     $('table#order_table tbody td:first-child').addClass('hide_');
    //                     $('table#order_table thead th:first-child').addClass('hide_');
    //                 }   
    //             }
    //             else 
    //                 $("#create_order_form_step_6").hide();
    //     }
    //         return false;
    // });


    function extract_number(str){
        return parseInt(str.replace(/\D/g, ''), 10);
    }

    $(document).on('click','.subform_btn',function(){
        let id_ = $(this).data('id');
        console.log("inside .subform_btn event",id_);
        $(`#${id_}`).addClass('show-modal');
        $(`#${id_}`).removeClass('hide-modal');
        $(`#entry_selector_${extract_number(id_)}`).removeClass('hide_');
        $("#active_pop_up_id").val(extract_number(id_)); // a hidden field which will count the current opened pop up id
        var $hinge_element = $(`#hinge_sub_details_${extract_number(id_)}`);
        var $drawer_element = $(`#drawer_sub_details_${extract_number(id_)}`);
        var $claps_elemnt = $(`#claps_sub_details${extract_number(id_)}`);
        if ($hinge_element.length) {
            // Get the display property of the element
            var display = $hinge_element.css('display');
            // console.log(display);
            // Check if the display property is not 'none'
            if (display !== 'none') {
                let total_xp = parseInt($(`#nh_${extract_number(id_)}`).val());
                // console.log("total_xp",total_xp);
                let data_id = $(`#nh_${extract_number(id_)}`).attr("data-id");
                // console.log("data_id",data_id);
                if ( total_xp <=6 ){
                    for (let i=0; i < 6; i++ )
                        $(`.xp${i+1}_div_${data_id}`).hide();

                    for (let i=0; i < total_xp; i++ )
                        $(`.xp${i+1}_div_${data_id}`).show();
                }

            } 
            // else {
            //   console.log('The element is not visible (display is set to none).');
            // }
        }
        // else if ($drawer_element.length){
        //     var display = $element.css('display');
        //     if (display !== 'none') {
                
                
        //     }





        // }else if ($claps_elemnt.length){
        //     var display = $element.css('display');
        //     if (display !== 'none') {   
        //     }

        // }

    });

    $(document).on('click','.close_modal',function(){
        let id_ = $(this).data('id');
        $(`#${id_}`).removeClass('show-modal');
        $(`#${id_}`).addClass('hide-modal');
        //$(`#drills_${id_}_body`).addClass('hide_');
        $("#active_pop_up_id").val(''); // a hidden field which will count the current opened pop up id
    });


   function labels_mapper(row_count_){
        console.log("row_count_",row_count_);
        let alphabets = ["zero","first","second","third","fourth","fifth"];
        let inputs = ["collection_barcode_td","height","width","quantity","knob_model","knob_position"];
        if ($("tbody#order_table_tbody tr").length == 1){
            console.log("I cant display label for copying the above row");
        }else{
                for (let i =0; i < alphabets.length; i++){
                    $(`#${alphabets[i]}_td_label_${row_count_ - 1}`).empty();
                    //let label = `<label for="remember" class="text-sm text-gray-600"><button type="button" title="Click to duplicate above row value" data-id="${row_count_}" class="duplicate_class_link text-dark-600 hover:underline" data-label="${inputs[i]}"><p class="text-dark text-[20px]">*</p></button><div></div></label>`;

                    let label = `<label for="remember" class="text-sm text-gray-600"><button type="button" title="${window.page.click_here_to_duplicate}" data-id="${row_count_}" class="duplicate_class_link text-dark-600 hover:underline" data-label="${inputs[i]}"><i class="!block text-[12px] hover:text-dark-500 transition ease-in-out duration-300  bx bx-copy"></i></button><div></div></label>`;

                    $(`#${alphabets[i]}_td_label_${row_count_}`).empty().append(label);
                } //end for loop here
        }
   } //end labels_mapper function here


 function findMissingFields(inputSelectors) {
            let missingFields = [];
            for (const selector of inputSelectors) {
                if ($(selector).val() === '') {
                    missingFields.push(selector);
                }
            }
            return missingFields;
    }


    $('#create_order_form_step_7').on('click', '#add_row_btn', function () {
        // check validations on inputs feeds by user in first row
        let all_collections_from_top =  get_all_collection_barcode_from_above_form();
        var row_count_ = $("tbody#order_table_tbody tr").length;
        let inputs = [`#width_${row_count_}`,`#height_${row_count_}`, `#quantity_${row_count_}`];
        //let inputs = ["input[name='width[]']","input[name='height[]']","input[name='quantity[]']"];
        let inputs2 = ["width[]","height[]","quantity[]"];
        let mappper_ = [window.page.width_required,window.page.height_required,window.page.quantity_required];
        const missingFields = findMissingFields(inputs);
        
        $("#quatity_counter").html(count_quantity());
            // let collection_index = 0;
            // //if (decision === "no")
            // //    collection_index = 3;
            // else

        if (missingFields.length > 0) {
            $("#error_fields").empty();
            for (const field of missingFields) {
                // console.log($(field).attr('name'));
                let error_=`<div class="mb-5 px-5 py-3 text-red-800 bg-red-100 border border-red-200 rounded-md dark:border-red-500/20 dark:text-red-200 dark:bg-red-500/20">${mappper_[inputs2.indexOf($(field).attr('name'))]}</div>`;
                $("#error_fields").append(error_);
            }
            $("#error_fields").removeClass('hide_');

        }else{
            // let d = $("#decision").val();
            $("#error_fields").addClass('hide_');
            var row_count_ = $("tbody#order_table_tbody tr").length + 1;
            $("table#order_table tbody#order_table_tbody").append(generate_row(row_count_));
            labels_mapper(row_count_);
            // get_knob_family(populateRowData_KnobFamily, row_count_);
            // if (d == "yes" && parseInt($(`#collection_${collection_index}_order_item_knobfamily_bool`).val())  == 1){
            //     console.log("Condition is true");
            //     specific_knob_family(row_count_);
            //     get_knob_position(populateRowData_KnobPositionEdit, row_count_);
            // }else{
            //     console.log("Condition is false");
            // }

            specific_knob_family(row_count_);
            get_knob_position(populateRowData_KnobPosition, row_count_);
            
            get_door_opening_sides(populateRowData_DoorSides, row_count_);
            get_hinge_provider(populateRowData_HingeProvider, row_count_);
            get_claps_pr_provider(populateRowData_clap_pr_provider, row_count_);
            get_drawer_data(populateRowData_DrawarData, row_count_);
            let decision = $("#decision").val();
            let counter = parseInt ($("#add_collection_btn").data('id'));
            // console.log("counter",counter);

            if (decision === "yes" && counter >= 4){
                // get_collection_data(populateRowData_Collection, row_count_);
                $('table#order_table tbody td:first-child').removeClass('hide_');
                $('table#order_table thead th:first-child').removeClass('hide_');
                $("#create_order_form_step_6").show();

            }
        
        }

        // else{

        //         Swal.fire(
        //             {
        //                 title:window.page.error,
        //                 // text: 'Some fields are still empty', 
        //                 text: window.page.step_1_details_msg_warning,
        //                 icon: 'warning',
        //                 showConfirmButton: false,
        //                 timer: 2000
        //             }
        //         );
            
        // }
    
    });// end #add_row_btn event



    // Function to remove objects based on partial key match
    function removeObjectsByPartialKey(array, partialKey) {
        return array.filter(obj => {
            for (const key in obj) {
                if (key.startsWith(partialKey)) {
                    return false; // Exclude this object
                }
            }
            return true; // Include this object
        });
    } //end removeObjectsByPartialKey here
  


    $('#order_table_tbody').on('click', '.delete_btn', function (e) {
        let row_to_delete_id = $(this).data('id');

        $(`table#order_table tbody#order_table_tbody tr#ot_row_${row_to_delete_id}`).remove();
        var row_count_ = $("tbody#order_table_tbody tr").length + 1;
        labels_mapper(row_count_);
        cards = removeObjectsByPartialKey(cards, `row_${row_to_delete_id}`);
        console.log("Remaining Cards:", cards);
    });// end .delete_btn event

   
    function deserializeFormData(formDataString) {
            var formData = {};
            formDataString.split('&').forEach(function (pair) {
                var keyValue = pair.split('=');
                formData[decodeURIComponent(keyValue[0])] = decodeURIComponent(keyValue[1] || '');
            });
            return formData;
    } //end deserializeFormData here

    function updateOrAppendObjectByKey(array, keyToReplace, newObject) {
            var indexToUpdate = array.findIndex(function(obj) {
                return Object.keys(obj)[0] === keyToReplace;
            });

            if (indexToUpdate !== -1) {
                // If the key exists, replace the existing object with the new one
                array.splice(indexToUpdate, 1, newObject);
            } else {
                // If the key doesn't exist, simply push the new object to the array
                array.push(newObject);
            }

            return array;
    } //end updateOrAppendObjectByKey here

    //////////////////////////////////////// Sub form submission
    // for tracking saved data of forms
    $('#order_table_tbody').on('submit', '.subform_temp', function (e) {
        e.preventDefault();
        let form_id = $(this).attr('id');
        let data =  deserializeFormData($(this).serialize());
        let key = `row_${extract_number(form_id)}_${data.subform_type}`;
        var myObject = {
            [key]: data
        };
        cards = updateOrAppendObjectByKey(cards, key, myObject);
        console.log("After cleaning at line#941",cards);
        let success_msg = '';
        if (data.subform_type ==  "drawer")
            success_msg = window.page.drawer_success_msg;
        else if (data.subform_type ==  "claps")
            success_msg = window.page.claps_success_msg;
        else if (data.subform_type ==  "hinge")
            success_msg = window.page.hinge_success_msg;

        let icon_class=`bx bx-check-shield`;
        let btn_class  = `subform_temp subform_btn text-white transition-all duration-300 ease-linear bg-green-500 border-green-500 rounded-full hover:bg-green-600 hover:border-green-600 hover:text-white active:bg-green-600 active:border-green-600 active:text-white focus:bg-green-600 focus:border-green-600 focus:text-white focus:ring focus:ring-green-500/30 btn`;
        if (data.subform_type != "notes"){
            $(`#plus_hinge_btn_${extract_number(form_id)}`).attr('class', btn_class).css('font-size','20px');
            $(`#plus_hinge_btn_${extract_number(form_id)}`).empty().append(`<i class="${icon_class}"></i>`);
        }
        Swal.fire(
            {
                title:window.page.data_saved_msg,
                text: `${success_msg}`,
                icon: 'success',
                showConfirmButton: false,
                timer: 2000
            }
        );
        $('.close_modal').click();
        console.log("Closing the modal");
        return false;
    });


    $('#order_table_tbody').on('click', '.duplicate_class_link', function (e) {
        e.preventDefault();
        let row_id = $(this).data('id');
        let label = $(this).data('label');
        $(`#${label}_${row_id}`).val($(`#${label}_${row_id - 1}`).val());
        var prev_row_id = extract_number ( $(`#ot_row_${row_id}`).prev('tr').attr('id'));
        console.log("prev_row_id=",prev_row_id);
        if(label=="knob_model"){
            if ($(`#${label}_${prev_row_id}`).val() != window.page.without_knob){
               $(`#knob_position_${row_id}`).removeClass('hide_');
                $(`#fifth_td_label_${row_id}`).removeClass('hide_');
            }
        }
        $("#quatity_counter").html(count_quantity());
        return false;
    });


    // this function will used for saving order as draft after some time
    function save_to_draft(){
        console.info("Inside save_to_draft() function");
        var form_data = new FormData(document.getElementById('create_order_form'));
        form_data.append('cards', JSON.stringify(cards));
        // form_data.append('step','step_insert');
        form_data.append('step','step_draft');
        form_data.append('from_draft_to_sent_form',1);
        form_data.append('knobs_tracker', JSON.stringify(knobs_tracker));
        form_data.append('keep_flow_tracker', JSON.stringify(keep_flow_tracker));
        // console.log(form_data);
        $.ajax({
                url:$("#link_to_add_").val(), // add url for posting request
                method:'POST',
                data:form_data,
                processData: false,  
                contentType: false, 
                dataType: 'JSON',
                success:function(data){
                    console.log(data);
                    $("input[name='order_item_ids[]']").remove();
                    $("#create_order_form_step_4").append(data.hidden_ids);
                }, //end success here
                error: function(data){
                    console.log(data);
                }
        }); //end ajax call here
    } //end save_to_draft function here



    // Listen for visibility change events
    // $(document).on('visibilitychange', function() {
    //     // Update the tabFocused variable when visibility changes
    //     var tabFocused = document.visibilityState === 'visible';
    //     if (!tabFocused){
    //         console.log('I am not active:', tabFocused);
    //         var isReadOnly = $("#client_order_name").prop("readonly"); // to check this form is already in draft or not
    //         if (isReadOnly){
    //             save_to_draft();
    //             // need to set from here


    //         }else{
    //             console.log("No info filled after draft order");
    //         }
    //     }
    // });


    // setInterval(function(){
    //     var isReadOnly = $("#client_order_name").prop("disabled");
    //     if (isReadOnly)
    //         save_to_draft();
    //     else
    //         console.info("Order is not saved by user, waiting for this action...");
    // }, 10000);


    $("#create_order_form").submit(function(e){
            e.preventDefault();

            var form_data = new FormData(document.getElementById('create_order_form'));
            form_data.append('cards', JSON.stringify(cards));
            form_data.append('step','step_draft_to_complete');
             //form_data.append('step','step_insert');
            

            form_data.append('knobs_tracker', JSON.stringify(knobs_tracker));
            form_data.append('keep_flow_tracker', JSON.stringify(keep_flow_tracker));


                    $.ajax({
                        url:$("#link_to_add_").val(), // add url for posting request
                        method:'POST',
                        data:form_data,
                        processData: false,  // Important: Don't process the data
                        contentType: false,  // Important: Don't set content type (automatically set to multipart/form-data)
                        dataType: 'JSON',
                        success:function(data){
                            
                            if (data.success == 1){
                                
                                // $("#create_order_form").remove();
                                // $("#form_btn").hide();
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
                                    location.href = $("#link_to_add_view").val(); 
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
