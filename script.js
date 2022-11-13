{
    const $form = document.querySelector("#form-");
    
    initRequiredMessage($form);
    initPrefectureOptions($form);
    initListeners($form);
    dateSet($form);
    setForm($form);
}

function setForm($form) {
    let url = new URL(window.location.href);
    let params = url.searchParams;
        console.log("aaaa");
        $form.name.value = params.get("name");
        $form.nameF.value = params.get("nameF");
        $form.property.value = params.get("property");
        $form.roomNum.value = params.get("roomNum");
        $form.tel.value = params.get("tel");
        $form.email.value = params.get("email");
        $form.zipcode.value = params.get("zipcode");
        $form.address_prefecture.value = params.get("address_prefecture");
        $form.address1.value = params.get("address1");
        $form.address2.value = params.get("address2");
        $form.address3.value = params.get("address3");
        $form.expiredDate.value = params.get("expiredDate");
        if(location.href.includes("confirm")){
            $form.notifiedDate.value = params.get("notifiedDate");
            $form.endDate.value = params.get("endDate");
            
        }
}

function dateSet($form) {
    const $today = new Date();
    let $endday = new Date();
    $endday.setMonth($endday.getMonth() + 1);

    if($form.querySelector("#notifiedDate")) $form.querySelector("#notifiedDate").value = $today.getFullYear() + "-" + ($today.getMonth()+1) +  "-" + $today.getDate();
    if($form.querySelector("#endDate")) $form.querySelector("#endDate").value = $endday.getFullYear() + "-" + ($endday.getMonth()+1) +  "-" + $endday.getDate();
    flatpickr("#expiredDate", {
        minDate: $today,
        maxDate: $endday
    })
}

function initRequiredMessage($form) {
    for (const $input of $form.querySelectorAll("[required]")) {
        const $container = $input.closest(".inputContainer").querySelector("label");
        const $message = $container.appendChild(document.createElement("span"));
        $message.textContent = "必須";
        $message.classList.add("requiredMessage");
    }
}

function initPrefectureOptions($form) {
    const prefectures = [ "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県", "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県", "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"];
    const $select_prefecture = $form.querySelector("select");
    if($select_prefecture){
        for (const prefecture of prefectures) {
            const $option = document.createElement("option");
            $option.textContent = prefecture;
            $option.value = prefecture;
            $select_prefecture.appendChild($option);
        }
    }
}

function initListeners($form) {
    if($form.zipcode)$form.zipcode.addEventListener("input", inputEvent => zipcodeInputHandler($form, inputEvent));
}


function zipcodeInputHandler($form, inputEvent) {
    const _zipcode = inputEvent.target.value.trim();
    const $input = inputEvent.target;

    if (!_zipcode.match(/^\d{3}-?\d{4}$/))
        return;
    
    const zipcode = _zipcode.replace("-", "");
    autoInputAddressFromZipcode($form, zipcode);
}

async function autoInputAddressFromZipcode($form, zipcode) {
    const $msg_searching = document.getElementById("statusMessage-searching");
    setAllAddressInputDisabled($form, true);
    $msg_searching.style.display = "inline";
    
    const result_fetchAddress = await new Promise(resolve => {
        fetchAddressFromZipcode(zipcode).then(resolve);
        setTimeout(resolve.bind(this, { isSuccess: false, code: "TIMEOUT" }), 1000 * 15);
    });
    
    setAllAddressInputDisabled($form, false);
    $msg_searching.style.display = "none";

    if (result_fetchAddress.isSuccess) {
        const addressData = result_fetchAddress.value;

        $form.address_prefecture.value = addressData.address1;
        $form.address1.value = addressData.address2;
        $form.address2.value = addressData.address3;
    } else {
        throw Error(`${result_fetchAddress.error.code}`);
    }
}

async function fetchAddressFromZipcode(zipcode) {
    const apiURL = `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipcode}`;
    const response = await fetch(apiURL);
    if (response.status !== 200)
        return {
            isSuccess: false,
            error: {
                code: "HTTP_REQUEST_ERROR"
            }
        };
    
    const responseData = await response.json();
    if (responseData.status === 400)
        return {
            isSuccess: false,
            error: {
                code: "INVALID_ZIPCODE"
            }
        };
    
    if (responseData.status === 200) {
        if (responseData.results == null)
            return {
                isSuccess: false,
                error: {
                    code: "ADDRESS_NOT_FOUND"
                }
            };
        return {
            isSuccess: true,
            value: responseData.results[0]
        };
    }

    console.log(responseData);
    throw Error(`not implemented`);
}

function setAllAddressInputDisabled($form, isDisabled) {
    for (const $input of [$form.address_prefecture, $form.address1, $form.address2, $form.address3])
        if (isDisabled)
            $input.setAttribute("disabled", "");
        else
            $input.removeAttribute("disabled");
}
