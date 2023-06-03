  /**
   * @title ContractName
   * @dev ContractDescription
   * @custom:dev-run-script file_path
   */
pragma solidity ^0.8.11;

contract BiometricContract {
    struct BiometricData {
        address sender;
        bytes32[4] encryptedData;
        bytes32 encryptedComment;
        uint256 unlockTime;
        // mapping(address => bool) authorizedReceivers;
        address[] authorizedReceivers;
        // mapping(address => bytes32) comments;
        bytes32[] comments;
    }

    mapping(address => BiometricData) public biometricRecords;
    mapping(address => bool) public verifiedDoctors;

    event BiometricDataUpdated(address indexed receiver, bytes32[4] encryptedData);

    // function encryptData(fixed[4] memory data, address[] memory receivers, bytes32 comment, uint256 unlockTime) public returns (bytes32[4] memory) {
    //     bytes32[4] memory encryptedData;

    //     // 생체 정보를 암호화하는 로직을 추가합니다.
    //     // 실제로 사용할 암호화 알고리즘을 구현해야 합니다.

    //     for (uint256 i = 0; i < 4; i++) {
    //         // 각 요소를 암호화하여 encryptedData에 저장합니다.
    //         // 실제 구현에 따라 암호화 로직이 달라질 수 있습니다.
    //         encryptedData[i] = keccak256(abi.encodePacked(data[i]));
    //     }

    //     sendBiometricData(encryptedData, comment, receivers, unlockTime);

    //     return encryptedData;
    // }

    function sendBiometricData(bytes32[4] memory encryptedData, bytes32 encryptedComment, address[] memory receivers, uint256 unlockTime) public {
        require(receivers.length > 0, "At least one receiver required");

        for (uint256 i = 0; i < receivers.length; i++) {
            address receiver = receivers[i];
            require(receiver != address(0), "Invalid receiver address");
            require(biometricRecords[receiver].encryptedData[0] == bytes32(0), "Data already exists for receiver");
            require(verifiedDoctors[receiver], "Receiver is not a verified doctor");

            address[] memory emptyArr;
            bytes32[] memory emptyArr_;

 
            biometricRecords[receiver] = BiometricData({
                sender: msg.sender,
                encryptedData: encryptedData,
                encryptedComment: encryptedComment,
                unlockTime: unlockTime,
                authorizedReceivers:emptyArr,
                comments:emptyArr_
            });

            // 수신자를 열람 권한 목록에 추가
            // biometricRecords[receiver].authorizedReceivers[receiver] = true;
            biometricRecords[receiver].authorizedReceivers.push(receiver);

            emit BiometricDataUpdated(receiver, encryptedData);
        }
    }

    function checkAuth(address _account ,BiometricData memory _biometricData) public view returns (bool){
        for(uint i=0; i < _biometricData.authorizedReceivers.length;i++){
            if(_biometricData.authorizedReceivers[i] == _account){
                return true;
            }
        }
        return false;
    } 

    // function getComment(address _account, BiometricData memory _biometricData) public view returns (bytes32[]){
    //     bytes32[] comments;
    //     for (uint i=0; i<_biometricData.comments.length;i++){
    //         // 자신이 작성한 코멘트인지 확인 후 comments 배열에 push
            
    //     }

    //     return comments;
    // }

    function getBiometricData(address _account) public view returns (bytes32[4] memory, bytes32, uint256) {
        BiometricData storage data = biometricRecords[_account];
        require(data.unlockTime >= block.timestamp, "Data locked");
        require(checkAuth(msg.sender,data), "Access denied");
        // // 데이터 복호화 로직을 추가합니다.
        // bytes32[4] memory decryptedData;
        // for (uint256 i = 0; i < 4; i++) {
        //     // 각 요소를 복호화하여 decryptedData에 저장합니다.
        //     // 실제 구현에 따라 복호화 로직이 달라질 수 있습니다.
        //     decryptedData[i] = decryptWithPrivateKey(data.encryptedData[i]);
        // }

        return (data.encryptedData, data.encryptedComment, data.unlockTime);
    }

    function getComment() public view returns (bytes32[] memory ) {
        BiometricData storage data = biometricRecords[msg.sender];
        require(data.sender == msg.sender, "Access denied");
        return data.comments;
    }

    function addComment(address receiverAccount,bytes32 comment) public {
        BiometricData storage data = biometricRecords[receiverAccount];
        require(checkAuth(msg.sender,data),"Biometric access not allowed");
        require(data.unlockTime >= block.timestamp, "Data locked");
        data.comments.push(comment);
    }

    function verifyDoctor(address doctor) public {
        // 의사면허 검증 로직을 구현합니다.
        // 실제 구현에는 외부 데이터 소스나 API 호출이 필요할 수 있습니다.
        bool isVerified = verifyDoctorLicense(doctor);
        verifiedDoctors[doctor] = isVerified;
    }

    function verifyDoctorLicense(address doctor) internal pure returns (bool) {
        // 의사면허 검증 로직을 구현합니다.
        // 실제 구현에는 의사면허 번호 확인 등의 과정이 필요합니다.
        // 이 예시에서는 단순히 true를 반환합니다.
        return true;
    }

    // // 가상 함수로, 실제로 암호화와 복호화를 수행하는 라이브러리나 외부 컨트랙트를 사용해야 합니다.
    // function decryptWithPrivateKey(bytes32 encryptedData) internal pure returns (bytes memory) {
    //     // 개인키를 사용하여 데이터를 복호화하는 로직을 구현해야 합니다.
    //     // 실제 구현은 암호화 라이브러리를 사용하거나 암호화 알고리즘을 직접 구현해야 합니다.
    //     // 이 예시에서는 단순히 바이트 배열을 반환합니다.
    //     return abi.encodePacked(encryptedData);
    // }
}
