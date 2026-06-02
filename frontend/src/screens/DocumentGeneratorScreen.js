import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Dimensions,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { CLIENT_PROFILE_API_URL, GENERATED_DOCUMENTS_API_URL } from '../config';

const { width } = Dimensions.get('window');

export const DocumentGeneratorScreen = ({ navigation, route }) => {
  const [currentView, setCurrentView] = useState('menu'); // 'menu', 'wizard', 'history', 'document_detail', 'client_profile'
  const [selectedTemplate, setSelectedTemplate] = useState(null); // 'contract', 'statement', 'poa'
  const [selectedMenuItem, setSelectedMenuItem] = useState(null); // 'contract', 'statement', 'poa', 'history', 'client_profile'
  const [activeFilter, setActiveFilter] = useState('History'); // 'History', 'Draft'
  const [currentStep, setCurrentStep] = useState(1);
  const [historyItems, setHistoryItems] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states for Contract Letter - Step 1 Cards (Identity, Address, Context)
  const [employerName, setEmployerName] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [employeeKtpAddress, setEmployeeKtpAddress] = useState('');
  const [employeeCurrentAddress, setEmployeeCurrentAddress] = useState('');
  const [sameAsKtp, setSameAsKtp] = useState(false);
  const [documentDescription, setDocumentDescription] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Form states for Contract Letter - Step 2 (Terms)
  const [startDate, setStartDate] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [salary, setSalary] = useState('');
  const [workingHours, setWorkingHours] = useState('40 hours/week');

  // Form states for Statement Letter
  const [declarantName, setDeclarantName] = useState('');
  const [declarantId, setDeclarantId] = useState('');
  const [declarantAddress, setDeclarantAddress] = useState('');
  const [statementDate, setStatementDate] = useState('');
  const [statementText, setStatementText] = useState('');
  
  // Upgraded Statement Letter States
  const [statementType, setStatementType] = useState('Statement of Truth');
  const [otherStatementType, setOtherStatementType] = useState('');
  const [showStatementTypeDropdown, setShowStatementTypeDropdown] = useState(false);
  const [declarantOccupation, setDeclarantOccupation] = useState('');
  const [statementSubject, setStatementSubject] = useState('');
  const [statementDestination, setStatementDestination] = useState('Personal');
  const [statementExpiryDate, setStatementExpiryDate] = useState('');
  const [fileEvidence, setFileEvidence] = useState(null);
  
  // Witnesses for Statement
  const [statementWitnesses, setStatementWitnesses] = useState([]);
  const [newWitnessName, setNewWitnessName] = useState('');
  const [newWitnessNik, setNewWitnessNik] = useState('');
  const [newWitnessAddress, setNewWitnessAddress] = useState('');
  const [showAddWitnessForm, setShowAddWitnessForm] = useState(false);
  
  // Notarization for Statement
  const [needNotary, setNeedNotary] = useState(false);
  const [notaryName, setNotaryName] = useState('');
  const [notaryOffice, setNotaryOffice] = useState('');

  const handleAddWitness = () => {
    if (!newWitnessName || !newWitnessNik || !newWitnessAddress) {
      Alert.alert("Fields Required", "Please fill in all Witness details.");
      return;
    }
    if (newWitnessNik.length !== 16 || isNaN(newWitnessNik)) {
      Alert.alert("Invalid NIK", "Witness NIK must be exactly 16 numeric digits.");
      return;
    }
    const newWitness = {
      id: 'witness-' + Date.now(),
      name: newWitnessName,
      nik: newWitnessNik,
      address: newWitnessAddress
    };
    setStatementWitnesses([...statementWitnesses, newWitness]);
    setNewWitnessName('');
    setNewWitnessNik('');
    setNewWitnessAddress('');
    setShowAddWitnessForm(false);
  };

  const handleRemoveWitness = (id) => {
    setStatementWitnesses(statementWitnesses.filter(w => w.id !== id));
  };

  // Form states for Power of Attorney (POA)
  const [authorizerName, setAuthorizerName] = useState('');
  const [authorizerId, setAuthorizerId] = useState('');
  const [authorizerAddress, setAuthorizerAddress] = useState('');
  const [authorizerOccupation, setAuthorizerOccupation] = useState('');

  const [attorneyName, setAttorneyName] = useState('');
  const [attorneyId, setAttorneyId] = useState('');
  const [attorneyBarLicense, setAttorneyBarLicense] = useState('');
  const [attorneyLawFirm, setAttorneyLawFirm] = useState('');
  const [attorneyAddress, setAttorneyAddress] = useState('');
  const [attorneyEmail, setAttorneyEmail] = useState('');
  const [attorneyPhone, setAttorneyPhone] = useState('');

  // Upgraded POA States
  const [poaType, setPoaType] = useState('General Power of Attorney');
  const [otherPoaType, setOtherPoaType] = useState('');
  const [showPoaTypeDropdown, setShowPoaTypeDropdown] = useState(false);

  // Scopes checkbox multi-select
  const [poaScopes, setPoaScopes] = useState({
    signDocuments: false,
    submitApplications: false,
    representInCourt: false,
    receivePayments: false,
    openBankAccounts: false,
    withdrawFunds: false,
    sellAssets: false,
    purchaseAssets: false,
    signContracts: false,
    negotiateAgreements: false,
    fileComplaints: false,
    handleTaxMatters: false,
  });

  // Limitations
  const [poaAuthorizedActions, setPoaAuthorizedActions] = useState('');
  const [poaRestrictedActions, setPoaRestrictedActions] = useState('');
  const [poaMaxTxValue, setPoaMaxTxValue] = useState('');

  // Objek Kuasa
  const [poaObjectType, setPoaObjectType] = useState('None'); // 'None', 'Property', 'Vehicle', 'Company'
  const [poaPropertyCertificate, setPoaPropertyCertificate] = useState('');
  const [poaPropertyAddress, setPoaPropertyAddress] = useState('');
  const [poaPropertyLandArea, setPoaPropertyLandArea] = useState('');
  const [poaPropertyBuildingArea, setPoaPropertyBuildingArea] = useState('');

  const [poaVehicleType, setPoaVehicleType] = useState('');
  const [poaVehiclePlate, setPoaVehiclePlate] = useState('');
  const [poaVehicleChassis, setPoaVehicleChassis] = useState('');
  const [poaVehicleEngine, setPoaVehicleEngine] = useState('');

  const [poaCompanyName, setPoaCompanyName] = useState('');
  const [poaCompanyRegNo, setPoaCompanyRegNo] = useState('');

  // Validity
  const [poaEffectiveDate, setPoaEffectiveDate] = useState('');
  const [poaExpiryDate, setPoaExpiryDate] = useState('');

  // Substitution & Revocation
  const [poaAllowSubstitution, setPoaAllowSubstitution] = useState(false);
  const [poaSubstituteConditions, setPoaSubstituteConditions] = useState('');
  const [poaRevocationConditions, setPoaRevocationConditions] = useState('');

  // ==================== CLIENT PROFILE FORM STATES ====================
  const [applicantType, setApplicantType] = useState('Individual'); // Individual, Company, Government, Organization
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  // 1. Individual Profile states
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('Male'); // Male, Female
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nationality, setNationality] = useState('Indonesian');
  const [maritalStatus, setMaritalStatus] = useState('Single'); // Single, Married, Divorced
  const [nik, setNik] = useState('');
  const [npwp, setNpwp] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Indonesia');
  const [occupation, setOccupation] = useState('');
  const [employer, setEmployer] = useState('');
  const [clientJobTitle, setClientJobTitle] = useState('');

  // 2. Company Profile states
  const [companyName, setCompanyName] = useState('');
  const [legalEntityType, setLegalEntityType] = useState('PT'); // PT, CV, Firm, Foundation
  const [businessRegNo, setBusinessRegNo] = useState(''); // NIB
  const [companyNpwp, setCompanyNpwp] = useState('');
  const [dateEstablished, setDateEstablished] = useState('');
  const [registeredAddress, setRegisteredAddress] = useState('');
  const [operationalAddress, setOperationalAddress] = useState('');
  // Company Representative details
  const [repName, setRepName] = useState('');
  const [repPositionState, setRepPositionState] = useState('');
  const [repNik, setRepNik] = useState('');
  const [repAuthorityBasis, setRepAuthorityBasis] = useState('');

  // 3. Government Profile states
  const [govtInstName, setGovtInstName] = useState('');
  const [govtInstType, setGovtInstType] = useState('Kementerian'); // Kementerian, Pemprov, Pemkab, dll
  const [govtSupervisingAgency, setGovtSupervisingAgency] = useState('');
  const [govtLevel, setGovtLevel] = useState('National'); // National, Provincial, City/Regency, District, Village
  const [govtRegNo, setGovtRegNo] = useState('');
  const [govtAgencyCode, setGovtAgencyCode] = useState('');
  const [govtDecreeNo, setGovtDecreeNo] = useState('');
  const [govtNpwp, setGovtNpwp] = useState('');
  const [govtAddress, setGovtAddress] = useState('');
  const [govtCity, setGovtCity] = useState('');
  const [govtProvince, setGovtProvince] = useState('');
  const [govtPostalCode, setGovtPostalCode] = useState('');
  const [govtCountry, setGovtCountry] = useState('Indonesia');
  const [govtEmail, setGovtEmail] = useState('');
  const [govtPhone, setGovtPhone] = useState('');
  const [govtWebsite, setGovtWebsite] = useState('');
  const [govtOfficerName, setGovtOfficerName] = useState('');
  const [govtOfficerPos, setGovtOfficerPos] = useState('');
  const [govtOfficerNip, setGovtOfficerNip] = useState('');
  const [govtOfficerRank, setGovtOfficerRank] = useState('');
  const [govtOfficerAppointNo, setGovtOfficerAppointNo] = useState('');
  const [govtOfficerAuthorityBasis, setGovtOfficerAuthorityBasis] = useState('');
  // Government Legal Upload Mock Status
  const [govtFileDecree, setGovtFileDecree] = useState(null); 
  const [govtFileAppoint, setGovtFileAppoint] = useState(null);
  const [govtFileNpwp, setGovtFileNpwp] = useState(null);
  const [govtFileOther, setGovtFileOther] = useState(null);
  // Additional Gov Data
  const [govtBudgetYr, setGovtBudgetYr] = useState('');
  const [govtProcurementNo, setGovtProcurementNo] = useState('');
  const [govtProjectNo, setGovtProjectNo] = useState('');
  const [govtContractPkgNo, setGovtContractPkgNo] = useState('');

  // 4. Organization Profile states
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('Foundation'); // Foundation, Association, NGO, etc.
  const [orgDeedNo, setOrgDeedNo] = useState('');
  const [orgDeedDate, setOrgDeedDate] = useState('');
  const [orgMinistryApprovalNo, setOrgMinistryApprovalNo] = useState('');
  const [orgRegNo, setOrgRegNo] = useState('');
  const [orgNpwp, setOrgNpwp] = useState('');
  const [orgRegAddress, setOrgRegAddress] = useState('');
  const [orgOpAddress, setOrgOpAddress] = useState('');
  const [orgCity, setOrgCity] = useState('');
  const [orgProvince, setOrgProvince] = useState('');
  const [orgPostalCode, setOrgPostalCode] = useState('');
  const [orgCountry, setOrgCountry] = useState('Indonesia');
  const [orgEmail, setOrgEmail] = useState('');
  const [orgPhone, setOrgPhone] = useState('');
  const [orgWebsite, setOrgWebsite] = useState('');
  // Multiple entry state for board members
  const [orgMembers, setOrgMembers] = useState([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPosition, setNewMemberPosition] = useState('');
  const [newMemberNik, setNewMemberNik] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  // Representative states
  const [orgRepName, setOrgRepName] = useState('');
  const [orgRepPosition, setOrgRepPosition] = useState('');
  const [orgRepAuthorityBasis, setOrgRepAuthorityBasis] = useState('');
  const [orgRepAppointmentDate, setOrgRepAppointmentDate] = useState('');
  // Operational details
  const [orgVision, setOrgVision] = useState('');
  const [orgMission, setOrgMission] = useState('');
  const [orgMainActivities, setOrgMainActivities] = useState('');
  const [orgMemberCount, setOrgMemberCount] = useState('');
  // Organization Legal Upload Mock Status
  const [orgFileDeed, setOrgFileDeed] = useState(null);
  const [orgFileAmendment, setOrgFileAmendment] = useState(null);
  const [orgFileMinistry, setOrgFileMinistry] = useState(null);
  const [orgFileNpwp, setOrgFileNpwp] = useState(null);
  const [orgFileAdart, setOrgFileAdart] = useState(null);
  const [orgFilePoa, setOrgFilePoa] = useState(null);

  // ==================== NEW CONTRACT LETTER STATES ====================
  const [clientProfiles, setClientProfiles] = useState([]);
  
  // 1. General Info & Parties
  const [contractTitle, setContractTitle] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [contractDate, setContractDate] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [governingLaw, setGoverningLaw] = useState('Indonesia');
  const [contractLanguage, setContractLanguage] = useState('Indonesian / English');
  
  const [firstPartyProfileId, setFirstPartyProfileId] = useState('');
  const [secondPartyProfileId, setSecondPartyProfileId] = useState('');
  const [secondPartyName, setSecondPartyName] = useState('');
  const [secondPartyAddress, setSecondPartyAddress] = useState('');
  const [secondPartyIdNo, setSecondPartyIdNo] = useState('');

  // 2. Ruang Lingkup
  const [contractPurpose, setContractPurpose] = useState('');
  const [contractBackground, setContractBackground] = useState('');
  const [scopeOfWork, setScopeOfWork] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [responsibilitiesFirst, setResponsibilitiesFirst] = useState('');
  const [responsibilitiesSecond, setResponsibilitiesSecond] = useState('');

  // 3. Nilai Kontrak
  const [contractCurrency, setContractCurrency] = useState('IDR (Rp)');
  const [contractValue, setContractValue] = useState('');
  const [taxIncluded, setTaxIncluded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  
  const [paymentStages, setPaymentStages] = useState([]);
  const [newStageName, setNewStageName] = useState('');
  const [newStageAmount, setNewStageAmount] = useState('');
  const [newStageDueDate, setNewStageDueDate] = useState('');
  const [newStageTrigger, setNewStageTrigger] = useState('');
  const [showAddStageForm, setShowAddStageForm] = useState(false);

  // 4. Jangka Waktu & Klausul
  const [contractStartDate, setContractStartDate] = useState('');
  const [contractEndDate, setContractEndDate] = useState('');
  const [renewalOption, setRenewalOption] = useState('No Renewal');
  
  const [clauses, setClauses] = useState({
    confidentiality: false,
    nonDisclosure: false,
    nonCompetition: false,
    intellectualProperty: false,
    forceMajeure: false,
    termination: false,
    disputeResolution: false,
    arbitration: false,
    governingLawClause: false,
    penaltyClause: false,
  });

  // 5. Lampiran & Signatures
  const [fileSupporting, setFileSupporting] = useState(null);
  const [fileTechnical, setFileTechnical] = useState(null);
  const [fileQuotation, setFileQuotation] = useState(null);
  const [fileInvoice, setFileInvoice] = useState(null);

  const [signatoryName, setSignatoryName] = useState('');
  const [signatoryPosition, setSignatoryPosition] = useState('');
  const [signatureMethod, setSignatureMethod] = useState('E-Signature');
  const [witnessName1, setWitnessName1] = useState('');
  const [witnessName2, setWitnessName2] = useState('');

  // Date Picker States
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerField, setDatePickerField] = useState(null); // 'contractDate', 'effectiveDate', etc.
  const [pickerDateVal, setPickerDateVal] = useState(new Date());

  const openDatePicker = (fieldName, currentValue) => {
    setDatePickerField(fieldName);
    let initialDate = new Date();
    if (currentValue) {
      const parsed = Date.parse(currentValue);
      if (!isNaN(parsed)) {
        initialDate = new Date(parsed);
      }
    }
    setPickerDateVal(initialDate);
    setShowDatePicker(true);
  };

  const onDatePickerChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split('T')[0];
      if (datePickerField === 'contractDate') setContractDate(formatted);
      else if (datePickerField === 'effectiveDate') setEffectiveDate(formatted);
      else if (datePickerField === 'expirationDate') setExpirationDate(formatted);
      else if (datePickerField === 'contractStartDate') setContractStartDate(formatted);
      else if (datePickerField === 'contractEndDate') setContractEndDate(formatted);
      else if (datePickerField === 'newStageDueDate') setNewStageDueDate(formatted);
      else if (datePickerField === 'statementDate') setStatementDate(formatted);
      else if (datePickerField === 'statementExpiryDate') setStatementExpiryDate(formatted);
      else if (datePickerField === 'poaEffectiveDate') setPoaEffectiveDate(formatted);
      else if (datePickerField === 'poaExpiryDate') setPoaExpiryDate(formatted);
      else if (datePickerField === 'dateOfBirth') setDateOfBirth(formatted);
      else if (datePickerField === 'dateEstablished') setDateEstablished(formatted);
      else if (datePickerField === 'orgDeedDate') setOrgDeedDate(formatted);
      else if (datePickerField === 'orgRepAppointmentDate') setOrgRepAppointmentDate(formatted);
      
      setPickerDateVal(selectedDate);
    }
  };

  const renderDatePickerOverlay = () => {
    if (!showDatePicker) return null;
    if (Platform.OS === 'ios') {
      return (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.iosModalOverlay}>
            <View style={styles.iosModalContent}>
              <View style={styles.iosModalHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.iosModalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.iosModalTitle}>Select Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.iosModalDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={pickerDateVal}
                mode="date"
                display="spinner"
                onChange={onDatePickerChange}
                textColor="#000000"
              />
            </View>
          </View>
        </Modal>
      );
    }
    return (
      <DateTimePicker
        value={pickerDateVal}
        mode="date"
        display="default"
        onChange={onDatePickerChange}
      />
    );
  };

  // Load history data from AsyncStorage and fetch client profiles
  useEffect(() => {
    loadHistory();
    loadClientProfiles();
  }, []);

  const loadClientProfiles = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (user) {
        const response = await fetch(`${CLIENT_PROFILE_API_URL}?action=list&user_id=${user.id}`);
        const resData = await response.json();
        if (resData.status === 'success') {
          setClientProfiles(resData.profiles || []);
        }
      }
    } catch (err) {
      console.error("Failed to load client profiles", err);
    }
  };

  const loadHistory = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (user) {
        const response = await fetch(`${GENERATED_DOCUMENTS_API_URL}?action=list&user_id=${user.id}`);
        const resData = await response.json();
        if (resData.status === 'success') {
          const mapped = (resData.documents || []).map(doc => ({
            id: doc.id,
            type: doc.type,
            title: doc.title,
            date: doc.document_date,
            status: doc.status,
            data: JSON.parse(doc.document_data),
            content: doc.content
          }));
          setHistoryItems(mapped);
          
          // Sync database cache to user-specific key in AsyncStorage
          await AsyncStorage.setItem(`generated_documents_${user.id}`, JSON.stringify(mapped));
          return;
        }
      }

      const storageKey = user ? `generated_documents_${user.id}` : 'generated_documents_guest';
      const stored = await AsyncStorage.getItem(storageKey);
      if (stored) {
        setHistoryItems(JSON.parse(stored));
      } else {
        // Pre-populate with high-fidelity mockup data
        const mockups = [
          {
            id: 'mock-1',
            type: 'contract',
            title: 'Employment Agreement - Sarah Jenkins',
            date: '2026-05-20',
            status: 'Completed',
            data: {
              employerName: 'Lawsy Corp Indonesia',
              employeeName: 'Sarah Jenkins',
              employeeId: '3174092801930002',
              employeeKtpAddress: 'Kebayoran Heights Block B/12, Jakarta',
              employeeCurrentAddress: 'Kebayoran Heights Block B/12, Jakarta',
              documentDescription: 'Professional services as a senior legal associate.',
              additionalNotes: 'Employment subject to annual performance evaluation.',
              startDate: '2026-06-01',
              jobTitle: 'Senior Legal Associate',
              salary: '18,500,000',
              workingHours: '40 hours/week',
            },
            content: `EMPLOYMENT AGREEMENT

This Agreement is made on this 20th day of May, 2026, by and between:
1. Lawsy Corp Indonesia, hereinafter referred to as the "Employer".
2. Sarah Jenkins, NIK: 3174092801930002, residing at Kebayoran Heights Block B/12, Jakarta, hereinafter referred to as the "Employee".

WHEREAS, the Employer desires to retain the services of the Employee, and the Employee desires to render services under the terms below:
Description: Professional services as a senior legal associate.

The Parties agree as follows:
1. Position: The Employee shall be employed in the position of Senior Legal Associate.
2. Duties: The Employee shall perform duties typical of this position and any other reasonable duties assigned.
3. Commencement: The employment shall commence on 2026-06-01.
4. Compensation: The Employer shall pay the Employee a monthly salary of Rp 18,500,000.
5. Working Hours: The working hours shall be 40 hours/week.

Additional Notes:
Employment subject to annual performance evaluation.

IN WITNESS WHEREOF, the Parties have executed this Agreement on the date first written above.

Employer:                                      Employee:
Lawsy Corp Indonesia                           Sarah Jenkins`
          },
          {
            id: 'mock-2',
            type: 'statement',
            title: 'Witness Statement - Traffic Incident N-21',
            date: '2026-05-18',
            status: 'Completed',
            data: {
              declarantName: 'Rafly Ramadhan',
              declarantId: '3275081203990001',
              declarantAddress: 'Jl. Kemang Raya No. 42, Jakarta Selatan',
              statementDate: '2026-05-18',
              statementText: 'I hereby declare that on the morning of May 15th, 2026, around 08:30 AM, I witnessed a collision between a black sedan and a motorcycle at the junction of Sudirman Avenue. The black sedan ran a red light while the motorcycle had the right of way. I am making this statement truthfully and without any coercion from any party.',
            },
            content: `STATEMENT LETTER

I, the undersigned below:
Name: Rafly Ramadhan
NIK / ID Card: 3275081203990001
Address: Jl. Kemang Raya No. 42, Jakarta Selatan

Hereby solemnly declare the following:
I hereby declare that on the morning of May 15th, 2026, around 08:30 AM, I witnessed a collision between a black sedan and a motorcycle at the junction of Sudirman Avenue. The black sedan ran a red light while the motorcycle had the right of way. I am making this statement truthfully and without any coercion from any party.

This statement is made with full legal responsibility and can be used for judicial or official investigation proceedings.

Jakarta, 2026-05-18

Declarant,
(Rafly Ramadhan)`
          },
          {
            id: 'mock-3',
            type: 'poa',
            title: 'Power of Attorney - Asset Disposal Representation',
            date: '2026-05-12',
            status: 'Draft',
            data: {
              authorizerName: 'Hendra Wijaya',
              authorizerId: '3201082205770003',
              authorizerAddress: 'Kebayoran Heights Block B/12, Jakarta',
              attorneyName: 'Budi Santoso, S.H.',
              attorneyId: '3171020412800004',
              attorneyAddress: 'Santoso & Partners Law Office, Sudirman, Jakarta',
              poaScope: 'Legal & General Representation',
              poaDetails: 'To represent, advocate for, and sign all necessary agreements, acts, and transfer deeds related to the selling process of the commercial property unit located at Sudirman Park, Tower B Floor 12, Unit A.',
            },
            content: `POWER OF ATTORNEY

The undersigned below:
Name: Hendra Wijaya
NIK: 3201082205770003
Address: Kebayoran Heights Block B/12, Jakarta
Hereinafter referred to as the "AUTHORIZER" (Pemberi Kuasa).

Hereby authorizes and appoints:
Name: Budi Santoso, S.H.
NIK: 3171020412800004
Address: Santoso & Partners Law Office, Sudirman, Jakarta
Hereinafter referred to as the "ATTORNEY" (Penerima Kuasa).

---------------------------------- SPECIAL POWERS ----------------------------------
To represent the Authorizer in all matters relating to:
Legal & General Representation

Specifically:
To represent, advocate for, and sign all necessary agreements, acts, and transfer deeds related to the selling process of the commercial property unit located at Sudirman Park, Tower B Floor 12, Unit A.

The Attorney shall have full authority to execute all acts necessary to carry out these powers.

Jakarta, 2026-05-12

Authorizer,                                    Attorney,
(Hendra Wijaya)                                (Budi Santoso, S.H.)`
          }
        ];
        await AsyncStorage.setItem(storageKey, JSON.stringify(mockups));
        setHistoryItems(mockups);
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  };

  const handleHelp = () => {
    Alert.alert(
      "Document Generator Help",
      "Draft customized, legal-grade documents easily.\n\n1. Select a document template from the list.\n2. Tap Continue to start the drafting wizard.\n3. Fill in the required details step by step.\n4. Review and save your document to the History section.",
      [{ text: "Understood", style: "default" }]
    );
  };

  const handleBack = () => {
    if (currentView === 'menu') {
      navigation.goBack();
    } else if (currentView === 'wizard') {
      if (currentStep > 1) {
        setCurrentStep(currentStep - 1);
      } else {
        setCurrentView('menu');
        setSelectedTemplate(null);
        setCurrentStep(1);
      }
    } else if (currentView === 'history' || currentView === 'document_detail' || currentView === 'client_profile') {
      setCurrentView('menu');
      setSelectedDoc(null);
    }
  };

  const handleSelectTemplate = (id) => {
    setSelectedTemplate(id);
    setCurrentView('wizard');
    setCurrentStep(1);
    
    // Reset all fields
    setEmployerName('');
    setEmployeeName('');
    setEmployeeId('');
    setEmployeeKtpAddress('');
    setEmployeeCurrentAddress('');
    setSameAsKtp(false);
    setDocumentDescription('');
    setAdditionalNotes('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setJobTitle('');
    setSalary('');
    setWorkingHours('40 hours/week');

    setDeclarantName('');
    setDeclarantId('');
    setDeclarantAddress('');
    setStatementDate(new Date().toISOString().split('T')[0]);
    setStatementText('');
    setStatementType('Statement of Truth');
    setOtherStatementType('');
    setShowStatementTypeDropdown(false);
    setDeclarantOccupation('');
    setStatementSubject('');
    setStatementDestination('Personal');
    setStatementExpiryDate('');
    setFileEvidence(null);
    setStatementWitnesses([]);
    setNewWitnessName('');
    setNewWitnessNik('');
    setNewWitnessAddress('');
    setShowAddWitnessForm(false);
    setNeedNotary(false);
    setNotaryName('');
    setNotaryOffice('');

    setAuthorizerName('');
    setAuthorizerId('');
    setAuthorizerAddress('');
    setAuthorizerOccupation('');
    setAttorneyName('');
    setAttorneyId('');
    setAttorneyBarLicense('');
    setAttorneyLawFirm('');
    setAttorneyAddress('');
    setAttorneyEmail('');
    setAttorneyPhone('');
    setPoaType('General Power of Attorney');
    setOtherPoaType('');
    setShowPoaTypeDropdown(false);
    setPoaScopes({
      signDocuments: false,
      submitApplications: false,
      representInCourt: false,
      receivePayments: false,
      openBankAccounts: false,
      withdrawFunds: false,
      sellAssets: false,
      purchaseAssets: false,
      signContracts: false,
      negotiateAgreements: false,
      fileComplaints: false,
      handleTaxMatters: false,
    });
    setPoaAuthorizedActions('');
    setPoaRestrictedActions('');
    setPoaMaxTxValue('');
    setPoaObjectType('None');
    setPoaPropertyCertificate('');
    setPoaPropertyAddress('');
    setPoaPropertyLandArea('');
    setPoaPropertyBuildingArea('');
    setPoaVehicleType('');
    setPoaVehiclePlate('');
    setPoaVehicleChassis('');
    setPoaVehicleEngine('');
    setPoaCompanyName('');
    setPoaCompanyRegNo('');
    setPoaEffectiveDate(new Date().toISOString().split('T')[0]);
    setPoaExpiryDate('');
    setPoaAllowSubstitution(false);
    setPoaSubstituteConditions('');
    setPoaRevocationConditions('');

    // Reset new comprehensive Contract fields
    setContractTitle('');
    setContractNumber('');
    setContractDate(new Date().toISOString().split('T')[0]);
    setEffectiveDate(new Date().toISOString().split('T')[0]);
    setExpirationDate('');
    setGoverningLaw('Indonesia');
    setContractLanguage('Indonesian / English');
    setFirstPartyProfileId('');
    setSecondPartyProfileId('');
    setSecondPartyName('');
    setSecondPartyAddress('');
    setSecondPartyIdNo('');
    setContractPurpose('');
    setContractBackground('');
    setScopeOfWork('');
    setDeliverables('');
    setResponsibilitiesFirst('');
    setResponsibilitiesSecond('');
    setContractCurrency('IDR (Rp)');
    setContractValue('');
    setTaxIncluded(false);
    setPaymentMethod('Bank Transfer');
    setPaymentStages([]);
    setNewStageName('');
    setNewStageAmount('');
    setNewStageDueDate('');
    setNewStageTrigger('');
    setShowAddStageForm(false);
    setContractStartDate(new Date().toISOString().split('T')[0]);
    setContractEndDate('');
    setRenewalOption('No Renewal');
    setClauses({
      confidentiality: false,
      nonDisclosure: false,
      nonCompetition: false,
      intellectualProperty: false,
      forceMajeure: false,
      termination: false,
      disputeResolution: false,
      arbitration: false,
      governingLawClause: false,
      penaltyClause: false,
    });
    setFileSupporting(null);
    setFileTechnical(null);
    setFileQuotation(null);
    setFileInvoice(null);
    setSignatoryName('');
    setSignatoryPosition('');
    setSignatureMethod('E-Signature');
    setWitnessName1('');
    setWitnessName2('');
  };

  const getContractContent = () => {
    const activeFirstParty = clientProfiles.find(p => p.id === firstPartyProfileId) || (clientProfiles.length > 0 ? clientProfiles[0] : null);
    const activeSecondParty = clientProfiles.find(p => p.id === secondPartyProfileId);

    const p1Name = activeFirstParty ? activeFirstParty.name : (fullName || '[First Party Name]');
    const p1Address = activeFirstParty ? activeFirstParty.address : (address || '[First Party Address]');
    const p1Id = activeFirstParty ? activeFirstParty.identifier_no : (nik || '[First Party ID]');

    const p2Name = activeSecondParty ? activeSecondParty.name : (secondPartyName || '[Second Party Name]');
    const p2Address = activeSecondParty ? activeSecondParty.address : (secondPartyAddress || '[Second Party Address]');
    const p2Id = activeSecondParty ? activeSecondParty.identifier_no : (secondPartyIdNo || '[Second Party ID]');

    let paymentsText = '';
    if (paymentStages.length > 0) {
      paymentsText = paymentStages.map((stage, idx) => {
        return `   ${idx + 1}. Phase/Stage: ${stage.stageName}
      Amount: ${contractCurrency === 'IDR (Rp)' ? 'Rp ' : '$ '}${stage.amount}
      Due Date: ${stage.dueDate || 'N/A'}
      Trigger Condition: ${stage.trigger || 'On demand'}`;
      }).join('\n\n');
    } else {
      paymentsText = `   - Single full payment of ${contractCurrency === 'IDR (Rp)' ? 'Rp ' : '$ '}${contractValue || '0'} paid via ${paymentMethod || 'Bank Transfer'}.`;
    }

    let clausesText = '';
    const activeClauses = [];
    if (clauses.confidentiality) activeClauses.push("CONFIDENTIALITY: Both parties agree to maintain the strict confidentiality of all proprietary information disclosed during this agreement.");
    if (clauses.nonDisclosure) activeClauses.push("NON-DISCLOSURE: Neither party shall disclose details of this contract or any operational secrets to any external third party without prior written consent.");
    if (clauses.nonCompetition) activeClauses.push("NON-COMPETITION: The Second Party shall not engage in any direct competitive business activity against the First Party during the term of this agreement.");
    if (clauses.intellectualProperty) activeClauses.push("INTELLECTUAL PROPERTY: All works, designs, codes, and deliverables created under this agreement shall remain the exclusive intellectual property of the First Party.");
    if (clauses.forceMajeure) activeClauses.push("FORCE MAJEURE: Neither party shall be liable for failure to perform duties due to natural disasters, acts of government, or other uncontrollable events.");
    if (clauses.termination) activeClauses.push("TERMINATION: This contract may be terminated by either party with a 30-day written notice or immediately in case of severe breach of terms.");
    if (clauses.disputeResolution) activeClauses.push("DISPUTE RESOLUTION: Any dispute arising from this contract shall first be resolved through amicable negotiation and mediation.");
    if (clauses.arbitration) activeClauses.push("ARBITRATION: If disputes cannot be resolved amicably, they shall be referred to and finally resolved by national arbitration boards.");
    if (clauses.governingLawClause) activeClauses.push(`GOVERNING LAW: This contract is governed by and shall be construed in accordance with the laws of ${governingLaw || 'Republic of Indonesia'}.`);
    if (clauses.penaltyClause) activeClauses.push("PENALTY CLAUSE: Any late payment or default of duties shall incur a penalty fee of 0.1% per day of delay up to a maximum of 10% of total contract value.");

    if (activeClauses.length > 0) {
      clausesText = activeClauses.map((c, idx) => `   Article ${idx + 4}. ${c}`).join('\n\n');
    } else {
      clausesText = "   Article 4. GENERAL PROVISIONS: Both parties agree to execute their duties in good faith and in compliance with local rules.";
    }

    const attachmentsList = [];
    if (fileSupporting) attachmentsList.push(`- Supporting Document: ${fileSupporting.name}`);
    if (fileTechnical) attachmentsList.push(`- Technical Specifications: ${fileTechnical.name}`);
    if (fileQuotation) attachmentsList.push(`- Quotation: ${fileQuotation.name}`);
    if (fileInvoice) attachmentsList.push(`- Invoice: ${fileInvoice.name}`);
    
    const attachmentsText = attachmentsList.length > 0 
      ? attachmentsList.join('\n') 
      : '- No supporting files attached.';

    return `CONTRACT AGREEMENT
================================================================
CONTRACT TITLE: ${contractTitle || '[Contract Title]'}
CONTRACT NUMBER: ${contractNumber || '[Contract Number]'}
CONTRACT DATE: ${contractDate || '[Contract Date]'}

This Contract Agreement (the "Agreement") is entered into and made effective as of ${effectiveDate || '[Effective Date]'} ("Effective Date"), by and between the following parties:

1. FIRST PARTY:
   Name: ${p1Name}
   NIK / ID: ${p1Id}
   Address: ${p1Address}

2. SECOND PARTY:
   Name: ${p2Name}
   NIK / ID: ${p2Id}
   Address: ${p2Address}

WHEREAS, the First Party desires to retain the services/products of the Second Party, and the Second Party desires to perform services under the terms below:

-------------------- ARTICLE 1: SCOPE OF WORK --------------------
1. Purpose: ${contractPurpose || '[Purpose of contract]'}
2. Background: ${contractBackground || '[Background context]'}
3. Scope of Work: ${scopeOfWork || '[Specific scope description]'}
4. Deliverables: ${deliverables || '[Deliverables schedule]'}

Responsibilities of First Party:
${responsibilitiesFirst || 'Deliver timely feedback and access to necessary resources.'}

Responsibilities of Second Party:
${responsibilitiesSecond || 'Provide high-quality professional deliverables.'}

----------------- ARTICLE 2: VALUE & PAYMENTS -----------------
1. Contract Value: ${contractCurrency || 'IDR (Rp)'} ${contractValue || '[Amount]'}
2. Tax Included: ${taxIncluded ? 'Yes' : 'No'}
3. Payment Method: ${paymentMethod || 'Bank Transfer'}

PAYMENT SCHEDULE:
${paymentsText}

----------------- ARTICLE 3: DURATION & END DATE -----------------
1. Start Date: ${contractStartDate || '[Start Date]'}
2. End Date: ${contractEndDate || '[End Date]'}
3. Renewal Option: ${renewalOption || 'None'}

----------------- ARTICLE 4: ADDITIONAL CLAUSES -----------------
${clausesText}

---------------------- ARTICLE 5: ATTACHMENTS ----------------------
${attachmentsText}

----------------- ARTICLE 6: SIGNATURES & WITNESSES -----------------
IN WITNESS WHEREOF, the Parties have executed this Agreement by their authorized representatives:

First Party Signatory:                          Second Party Signatory:
Name: ${signatoryName || p1Name}              Name: ${p2Name}
Position: ${signatoryPosition || '[First Party Position]'}    Position: Representative
Signature Method: ${signatureMethod}            Signature Method: Hand-drawn / Seal

Witness 1:                                      Witness 2:
${witnessName1 || '[Witness 1 Name]'}           ${witnessName2 || '[Witness 2 Name]'}`;
  };

  const getStatementContent = () => {
    const activeType = statementType === 'Other' ? (otherStatementType || 'Custom Statement') : statementType;
    
    // Compile witnesses
    let witnessesSection = '';
    if (statementWitnesses.length > 0) {
      witnessesSection = `\n---------------------- CO-SIGNING WITNESSES ----------------------\n` +
        statementWitnesses.map((w, idx) => `Witness ${idx + 1}:\n   Name: ${w.name}\n   NIK: ${w.nik}\n   Address: ${w.address}`).join('\n\n');
    } else {
      witnessesSection = `\n- No co-signing witnesses designated.`;
    }

    // Compile Notarization Clause
    let notarySection = '';
    if (needNotary) {
      notarySection = `\n---------------------- NOTARIAL CERTIFICATION ----------------------\n` +
        `STATE OF NOTARY REGISTRATION\n` +
        `This document is officially certified and sealed by the registered Notary Public:\n` +
        `Notary Public Name: ${notaryName || '[Notary Name]'}\n` +
        `Office Address: ${notaryOffice || '[Notary Office]'}\n` +
        `The Declarant has signed and affirmed this statement in the presence of the Notary on this day.`;
    }

    // Evidence
    const evidenceText = fileEvidence ? `- Supporting Evidence File: ${fileEvidence.name}` : '- No supporting physical evidence attached.';

    return `FORMAL STATEMENT OF ${activeType.toUpperCase()}
================================================================
STATEMENT TYPE: ${activeType}
LETTER DESTINATION: ${statementDestination}
STATEMENT SUBJECT: ${statementSubject || '[Subject of Statement]'}

I, the undersigned declarant:
Name: ${declarantName || '[Declarant Full Name]'}
NIK / ID Card: ${declarantId || '[NIK / ID Card Number]'}
Occupation: ${declarantOccupation || '[Declarant Occupation]'}
Address: ${declarantAddress || '[Full Address]'}

Do hereby solemnly declare and affirm the following statement in good faith:

SUBJECT MATTER:
${statementSubject || '[Subject of Statement]'}

STATEMENT BODY:
${statementText || '[Please write statement/declaration text in Step 2]'}

TERMS & SPECIFICATIONS:
- Effective Date: ${statementDate || '[Effective Date]'}
- Expiration Date: ${statementExpiryDate || 'Indefinite / Permanent'}
${evidenceText}

This statement is made under penalty of perjury under the governing laws. All information provided is declared to be true, accurate, and complete.

${witnessesSection}
${notarySection}

Dated: ${statementDate || '[Statement Date]'}

Declarant,


(${declarantName || '[Declarant Name]'})`;
  };

  const getPoaContent = () => {
    const activeType = poaType === 'Other' ? (otherPoaType || 'Custom Power of Attorney') : poaType;

    // Compile active scopes
    const scopesList = [];
    if (poaScopes.signDocuments) scopesList.push("Sign and execute official documents and legal letters");
    if (poaScopes.submitApplications) scopesList.push("Submit applications, permits, registrations, or official requests");
    if (poaScopes.representInCourt) scopesList.push("Represent the Authorizer before court hearings and judicial proceedings");
    if (poaScopes.receivePayments) scopesList.push("Receive payments, cash, checks, or financial disbursements");
    if (poaScopes.openBankAccounts) scopesList.push("Open, manage, and close bank accounts");
    if (poaScopes.withdrawFunds) scopesList.push("Withdraw or transfer financial funds up to designated limits");
    if (poaScopes.sellAssets) scopesList.push("Sell, transfer, alienate, or dispose of designated assets or properties");
    if (poaScopes.purchaseAssets) scopesList.push("Purchase, acquire, or lease designated assets or properties");
    if (poaScopes.signContracts) scopesList.push("Sign and execute binding business contracts and commercial agreements");
    if (poaScopes.negotiateAgreements) scopesList.push("Negotiate and settle terms, disputes, or contracts with third parties");
    if (poaScopes.fileComplaints) scopesList.push("File official complaints, police reports, or administrative protests");
    if (poaScopes.handleTaxMatters) scopesList.push("Handle, file, and settle official tax returns and administrative tax issues");

    const scopesText = scopesList.length > 0 
      ? scopesList.map((s, idx) => `   [X] Scope ${idx + 1}: ${s}`).join('\n')
      : "   [ ] No specific general scopes of authority selected.";

    // Compile Object of Power
    let objectText = '';
    if (poaObjectType === 'Property') {
      objectText = `REAL PROPERTY OBJECT DETAILS:\n` +
        `- Property Certificate Number: ${poaPropertyCertificate || '[Not Specified]'}\n` +
        `- Location Address: ${poaPropertyAddress || '[Not Specified]'}\n` +
        `- Land Area: ${poaPropertyLandArea ? `${poaPropertyLandArea} sqm` : '[Not Specified]'}\n` +
        `- Building Area: ${poaPropertyBuildingArea ? `${poaPropertyBuildingArea} sqm` : '[Not Specified]'}`;
    } else if (poaObjectType === 'Vehicle') {
      objectText = `VEHICLE OBJECT DETAILS:\n` +
        `- Vehicle Type/Brand: ${poaVehicleType || '[Not Specified]'}\n` +
        `- Plate Number: ${poaVehiclePlate || '[Not Specified]'}\n` +
        `- Chassis Number: ${poaVehicleChassis || '[Not Specified]'}\n` +
        `- Engine Number: ${poaVehicleEngine || '[Not Specified]'}`;
    } else if (poaObjectType === 'Company') {
      objectText = `CORPORATE OBJECT DETAILS:\n` +
        `- Company/Entity Name: ${poaCompanyName || '[Not Specified]'}\n` +
        `- Business Registration Number (NIB): ${poaCompanyRegNo || '[Not Specified]'}`;
    } else {
      objectText = `OBJECT OF POWER:\n- No specific physical or corporate object designated.`;
    }

    // Compile Substitution Right
    const substitutionText = poaAllowSubstitution 
      ? `RIGHT OF SUBSTITUTION:\n` +
        `The Attorney IS granted the right to substitute this power of attorney to a third party under the following conditions:\n` +
        `   Conditions: ${poaSubstituteConditions || 'Subject to written approval by the Authorizer.'}`
      : `RIGHT OF SUBSTITUTION:\n` +
        `The Attorney IS NOT granted the right to substitute this power of attorney. The right of substitution is strictly prohibited.`;

    // Revocation conditions
    const revocationText = poaRevocationConditions || 'This Power of Attorney shall remain valid unless revoked in writing by the Authorizer.';

    return `FORMAL POWER OF ATTORNEY (${activeType.toUpperCase()})
================================================================
POA CLASSIFICATION: ${activeType}
EFFECTIVE DATE: ${poaEffectiveDate || '[Effective Date]'}
EXPIRATION DATE: ${poaExpiryDate || 'Indefinite / Permanent / Revocable'}

On this day, the undersigned parties hereby agree to establish this Power of Attorney:

----------------------- AUTHORIZER -----------------------
Full Name: ${authorizerName || '[Authorizer Full Name]'}
NIK / ID Card: ${authorizerId || '[Authorizer NIK]'}
Occupation: ${authorizerOccupation || '[Authorizer Occupation]'}
Address: ${authorizerAddress || '[Authorizer Full Address]'}

Hereinafter referred to as the "AUTHORIZER".

----------------------- ATTORNEY -----------------------
Full Name: ${attorneyName || '[Attorney Full Name]'}
NIK / ID Card: ${attorneyId || '[Attorney NIK]'}
${attorneyBarLicense ? `BAR License Number: ${attorneyBarLicense}\n` : ''}${attorneyLawFirm ? `Law Firm / Affiliation: ${attorneyLawFirm}\n` : ''}Address: ${attorneyAddress || '[Attorney Full Address]'}
Email: ${attorneyEmail || '[Attorney Email]'}
Phone: ${attorneyPhone || '[Attorney Phone Number]'}

Hereinafter referred to as the "ATTORNEY".

The Authorizer hereby grants full power and authority to the Attorney to represent, act for, and perform on behalf of the Authorizer in accordance with the scopes and limitations set forth below:

---------------------- SCOPE OF AUTHORITY ----------------------
The Attorney is authorized to perform the following actions:
${scopesText}

---------------------- LIMITATIONS OF AUTHORITY ----------------------
- Specific Authorized Actions:
  ${poaAuthorizedActions || 'Perform all standard administrative and legal functions matching the chosen scopes.'}
- Specifically Restricted/Prohibited Actions:
  ${poaRestrictedActions || 'Cannot assign powers to third parties without prior written consent. No other restrictions specified.'}
- Maximum Authorized Transaction Value:
  ${poaMaxTxValue ? `IDR / USD ${poaMaxTxValue}` : 'No maximum financial limit designated.'}

---------------------- TARGET OBJECT OF POWER ----------------------
${objectText}

---------------------- VALIDITY & FORMAL TERMS ----------------------
- Effective Period: Commences on ${poaEffectiveDate || '[Start Date]'} and expires on ${poaExpiryDate || 'Indefinite/Upon Revocation'}.
- ${substitutionText}
- Revocation Clause:
  ${revocationText}

This Power of Attorney is made in good faith with full legal capacity and compliance with the governing laws.

Dated: ${poaEffectiveDate || '[Effective Date]'}

Authorizer (Grantor),                          Attorney (Agent),


(${authorizerName || '[Authorizer Name]'})                      (${attorneyName || '[Attorney Name]'})`;
  };

  const getClientProfileContent = () => {
    if (applicantType === 'Individual') {
      return `CLIENT LEGAL PROFILE
================================================================
APPLICANT TYPE: INDIVIDUAL

-------------------- PERSONAL IDENTITY --------------------
Full Name: ${fullName || '[Full Name]'}
Gender: ${gender}
Place, Date of Birth: ${placeOfBirth || '[Place]'}, ${dateOfBirth || '[Date]'}
Nationality: ${nationality || '[Nationality]'}
Marital Status: ${maritalStatus}

IDENTITY:
NIK / National ID: ${nik || '[NIK]'}
NPWP: ${npwp || '[NPWP]'}

CONTACT DETAILS:
Email Address: ${email || '[Email]'}
Phone Number: ${phone || '[Phone]'}
Whatsapp Number: ${whatsapp || '[Whatsapp]'}

ADDRESS INFORMATION:
Address: ${address || '[Address]'}
City: ${city || '[City]'}
Province: ${province || '[Province]'}
Postal Code: ${postalCode || '[Postal Code]'}
Country: ${country || '[Country]'}

EMPLOYMENT DETAILS (JOBS):
Occupation: ${occupation || '[Occupation]'}
Employer: ${employer || '[Employer]'}
Job Title: ${clientJobTitle || '[Job Title]'}
================================================================
Lawsy AI Sealed & Verified`;
    } else if (applicantType === 'Company') {
      return `CLIENT LEGAL PROFILE
================================================================
APPLICANT TYPE: COMPANY

-------------------- COMPANY INFORMATION --------------------
Company Name: ${companyName || '[Company Name]'}
Legal Entity Type: ${legalEntityType}
Business Registration No (NIB): ${businessRegNo || '[NIB]'}
Tax Registration No (NPWP): ${companyNpwp || '[NPWP]'}
Date Established: ${dateEstablished || '[Date Established]'}
Registered Address: ${registeredAddress || '[Registered Address]'}
Operational Address: ${operationalAddress || '[Operational Address]'}

----------------------- REPRESENTATIVE -----------------------
Representative Name: ${repName || '[Full Name]'}
Position: ${repPositionState || '[Position]'}
NIK / ID Card Number: ${repNik || '[NIK]'}
Authority Basis: ${repAuthorityBasis || '[Authority Basis]'}
================================================================
Lawsy AI Sealed & Verified`;
    } else if (applicantType === 'Government') {
      return `CLIENT LEGAL PROFILE
================================================================
APPLICANT TYPE: GOVERNMENT INSTITUTION

--------------------- INSTANSI INFORMATION ---------------------
Institution Name: ${govtInstName || '[Institution Name]'}
Institution Type: ${govtInstType}
Ministry/Supervising Agency: ${govtSupervisingAgency || '[Agency]'}
Government Level: ${govtLevel}

REGISTRATION NUMBERS:
Institution Registration No: ${govtRegNo || '[Registration Number]'}
Agency Code: ${govtAgencyCode || '[Agency Code]'}
Official Decree Number: ${govtDecreeNo || '[Decree Number]'}
Tax Number (NPWP): ${govtNpwp || '[NPWP]'}

ADDRESS DETAILS:
Office Address: ${govtAddress || '[Address]'}
City: ${govtCity || '[City]'}
Province: ${govtProvince || '[Province]'}
Postal Code: ${govtPostalCode || '[Postal Code]'}
Country: ${govtCountry || '[Country]'}

CONTACTS:
Official Email: ${govtEmail || '[Email]'}
Phone Number: ${govtPhone || '[Phone]'}
Website: ${govtWebsite || '[Website]'}

SIGNING OFFICER (PEJABAT PENANDATANGAN):
Full Name: ${govtOfficerName || '[Full Name]'}
Position: ${govtOfficerPos || '[Position]'}
Employee Number (NIP): ${govtOfficerNip || '[NIP]'}
Rank/Golongan: ${govtOfficerRank || '[Rank]'}
Appointment Decree Number: ${govtOfficerAppointNo || '[Decree Number]'}
Authority Basis: ${govtOfficerAuthorityBasis || '[Authority Basis]'}

ADDITIONAL DETAILS:
Budget Year: ${govtBudgetYr || '[Budget Year]'}
Procurement Number: ${govtProcurementNo || '[Procurement Number]'}
Government Project Number: ${govtProjectNo || '[Project Number]'}
Contract Package Number: ${govtContractPkgNo || '[Contract Package Number]'}

ATTACHED DOCUMENTS:
- Surat Keputusan Pembentukan: ${govtFileDecree || 'Not uploaded'}
- Surat Penunjukan Pejabat: ${govtFileAppoint || 'Not uploaded'}
- NPWP Instansi: ${govtFileNpwp || 'Not uploaded'}
- Dokumen Pendukung Lain: ${govtFileOther || 'None'}
================================================================
Lawsy AI Sealed & Verified`;
    } else if (applicantType === 'Organization') {
      return `CLIENT LEGAL PROFILE
================================================================
APPLICANT TYPE: ORGANIZATION / FOUNDATION

-------------------- ORGANIZATION DETAILS --------------------
Organization Name: ${orgName || '[Organization Name]'}
Organization Type: ${orgType}

LEGAL INFORMATION:
Deed Number (Akta Pendirian): ${orgDeedNo || '[Deed Number]'}
Deed Date: ${orgDeedDate || '[Deed Date]'}
Ministry Approval Number (SK): ${orgMinistryApprovalNo || '[Approval Number]'}
Registration Number: ${orgRegNo || '[Registration Number]'}
NPWP: ${orgNpwp || '[NPWP]'}

ADDRESS DETAILS:
Registered Address: ${orgRegAddress || '[Registered Address]'}
Operational Address: ${orgOpAddress || '[Operational Address]'}
City: ${orgCity || '[City]'}
Province: ${orgProvince || '[Province]'}
Postal Code: ${orgPostalCode || '[Postal Code]'}
Country: ${orgCountry || '[Country]'}

CONTACTS:
Official Email: ${orgEmail || '[Email]'}
Phone Number: ${orgPhone || '[Phone]'}
Website: ${orgWebsite || '[Website]'}

ORGANIZATION BOARD (PENGURUS ORGANISASI):
${orgMembers.length > 0 ? orgMembers.map((m, index) => `${index + 1}. ${m.name} (${m.position}) - NIK: ${m.nik}${m.email ? `, Email: ${m.email}` : ''}${m.phone ? `, Phone: ${m.phone}` : ''}`).join('\n') : 'No board members added.'}

SIGNING REPRESENTATIVE (PERWAKILAN PENANDATANGAN):
Representative Name: ${orgRepName || '[Full Name]'}
Position: ${orgRepPosition || '[Position]'}
Authority Basis: ${orgRepAuthorityBasis || '[Authority Basis]'}
Appointment Date: ${orgRepAppointmentDate || '[Appointment Date]'}

OPERATIONAL DETAILS:
Vision: ${orgVision || '[Vision]'}
Mission: ${orgMission || '[Mission]'}
Main Activities: ${orgMainActivities || '[Activities]'}
Number of Members: ${orgMemberCount || '[Member Count]'}

ATTACHED DOCUMENTS:
- Akta Pendirian: ${orgFileDeed || 'Not uploaded'}
- Akta Perubahan: ${orgFileAmendment || 'Not uploaded'}
- SK Kemenkumham: ${orgFileMinistry || 'Not uploaded'}
- NPWP: ${orgFileNpwp || 'Not uploaded'}
- AD/ART: ${orgFileAdart || 'Not uploaded'}
- Surat Kuasa: ${orgFilePoa || 'None'}
================================================================
Lawsy AI Sealed & Verified`;
    }
    return '';
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const text = getPreviewText();
      let title = '';
      let data = {};

      if (selectedTemplate === 'contract') {
        title = contractTitle || `Contract - ${secondPartyName || 'Draft'}`;
        data = {
          contractTitle, contractNumber, contractDate, effectiveDate, expirationDate, governingLaw, contractLanguage,
          firstPartyProfileId, secondPartyProfileId, secondPartyName, secondPartyAddress, secondPartyIdNo,
          contractPurpose, contractBackground, scopeOfWork, deliverables, responsibilitiesFirst, responsibilitiesSecond,
          contractCurrency, contractValue, taxIncluded, paymentMethod, paymentStages,
          contractStartDate, contractEndDate, renewalOption, clauses,
          fileSupporting, fileTechnical, fileQuotation, fileInvoice,
          signatoryName, signatoryPosition, signatureMethod, witnessName1, witnessName2
        };
      } else if (selectedTemplate === 'statement') {
        title = `Statement - ${declarantName}`;
        data = {
          statementType, otherStatementType, declarantName, declarantId, declarantAddress, declarantOccupation,
          statementSubject, statementDestination, statementExpiryDate, fileEvidence,
          statementWitnesses, needNotary, notaryName, notaryOffice, statementDate, statementText
        };
      } else if (selectedTemplate === 'poa') {
        title = `POA - ${attorneyName}`;
        data = {
          poaType, otherPoaType,
          authorizerName, authorizerId, authorizerAddress, authorizerOccupation,
          attorneyName, attorneyId, attorneyBarLicense, attorneyLawFirm, attorneyAddress, attorneyEmail, attorneyPhone,
          poaScopes,
          poaAuthorizedActions, poaRestrictedActions, poaMaxTxValue,
          poaObjectType, poaPropertyCertificate, poaPropertyAddress, poaPropertyLandArea, poaPropertyBuildingArea,
          poaVehicleType, poaVehiclePlate, poaVehicleChassis, poaVehicleEngine,
          poaCompanyName, poaCompanyRegNo,
          poaEffectiveDate, poaExpiryDate,
          poaAllowSubstitution, poaSubstituteConditions,
          poaRevocationConditions
        };
      }

      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      if (user) {
        const formData = new FormData();
        formData.append('user_id', user.id);
        formData.append('type', selectedTemplate);
        formData.append('title', title || 'Legal Draft');
        formData.append('document_date', new Date().toISOString().split('T')[0]);
        formData.append('status', 'Completed');
        formData.append('document_data', JSON.stringify(data));
        formData.append('content', text);

        const response = await fetch(`${GENERATED_DOCUMENTS_API_URL}?action=save`, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        });

        const resData = await response.json();
        if (resData.status !== 'success') {
          Alert.alert("Save Failed", resData.message || "Failed to save document to database.");
          setLoading(false);
          return;
        }

        await loadHistory();
      } else {
        const newDoc = {
          id: 'doc-' + Date.now(),
          type: selectedTemplate,
          title: title || 'Legal Draft',
          date: new Date().toISOString().split('T')[0],
          status: 'Completed',
          data,
          content: text,
        };

        const updatedHistory = [newDoc, ...historyItems];
        const storageKey = user ? `generated_documents_${user.id}` : 'generated_documents_guest';
        await AsyncStorage.setItem(storageKey, JSON.stringify(updatedHistory));
        setHistoryItems(updatedHistory);
      }

      Alert.alert(
        "Document Generated!",
        "Your legal document has been drafted and saved successfully.",
        [
          { 
            text: "View History", 
            onPress: () => {
              setCurrentView('history');
              setSelectedTemplate(null);
            } 
          },
          {
            text: "Done",
            onPress: () => {
              setCurrentView('menu');
              setSelectedTemplate(null);
            }
          }
        ]
      );
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to generate and save document.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClientProfile = async () => {
    // Validations
    if (applicantType === 'Individual') {
      if (!fullName || !placeOfBirth || !dateOfBirth || !nik || !email || !phone || !address || !city || !province || !postalCode) {
        Alert.alert("Required Fields", "Please complete all required fields for the Individual profile.");
        return;
      }
      if (nik.length !== 16 || isNaN(nik)) {
        Alert.alert("Invalid NIK", "NIK/National ID Number must be exactly 16 numeric digits.");
        return;
      }
    } else if (applicantType === 'Company') {
      if (!companyName || !businessRegNo || !companyNpwp || !registeredAddress || !repName || !repPositionState || !repNik || !repAuthorityBasis) {
        Alert.alert("Required Fields", "Please complete all required Company fields.");
        return;
      }
      if (repNik.length !== 16 || isNaN(repNik)) {
        Alert.alert("Invalid NIK", "Representative NIK must be exactly 16 numeric digits.");
        return;
      }
    } else if (applicantType === 'Government') {
      if (!govtInstName || !govtRegNo || !govtAgencyCode || !govtDecreeNo || !govtNpwp || !govtAddress || !govtCity || !govtProvince || !govtPostalCode || !govtOfficerName || !govtOfficerPos || !govtOfficerNip || !govtOfficerAuthorityBasis) {
        Alert.alert("Required Fields", "Please complete all required Government fields.");
        return;
      }
      if (govtOfficerNip.length !== 18 || isNaN(govtOfficerNip)) {
        Alert.alert("Invalid NIP", "Signing Officer Employee Number (NIP) must be exactly 18 numeric digits.");
        return;
      }
    } else if (applicantType === 'Organization') {
      if (!orgName || !orgDeedNo || !orgMinistryApprovalNo || !orgRegNo || !orgNpwp || !orgRegAddress || !orgCity || !orgProvince || !orgPostalCode || !orgRepName || !orgRepPosition || !orgRepAuthorityBasis) {
        Alert.alert("Required Fields", "Please complete all required Organization/Foundation fields.");
        return;
      }
    }

    setLoading(true);
    try {
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user) {
        Alert.alert("Error", "User not logged in. Please log in first.");
        setLoading(false);
        return;
      }

      const profileText = getClientProfileContent();
      const profileTitle = applicantType === 'Individual' ? `Profile - ${fullName}` 
                         : applicantType === 'Company' ? `Profile - ${companyName}`
                         : applicantType === 'Government' ? `Profile - ${govtInstName}`
                         : `Profile - ${orgName}`;

      const rawProfileData = {
        fullName, gender, placeOfBirth, dateOfBirth, nationality, maritalStatus, nik, npwp, email, phone, whatsapp, address, city, province, postalCode, country, occupation, employer, clientJobTitle,
        companyName, legalEntityType, businessRegNo, companyNpwp, dateEstablished, registeredAddress, operationalAddress,
        repName, repPositionState, repNik, repAuthorityBasis,
        govtInstName, govtInstType, govtSupervisingAgency, govtLevel, govtRegNo, govtAgencyCode, govtDecreeNo, govtNpwp, govtAddress, govtCity, govtProvince, govtPostalCode, govtCountry, govtEmail, govtPhone, govtWebsite, govtOfficerName, govtOfficerPos, govtOfficerNip, govtOfficerRank, govtOfficerAppointNo, govtOfficerAuthorityBasis, govtBudgetYr, govtProcurementNo, govtProjectNo, govtContractPkgNo,
        orgName, orgType, orgDeedNo, orgDeedDate, orgMinistryApprovalNo, orgRegNo, orgNpwp, orgRegAddress, orgOpAddress, orgCity, orgProvince, orgPostalCode, orgCountry, orgEmail, orgPhone, orgWebsite, orgMembers, orgRepName, orgRepPosition, orgRepAuthorityBasis, orgRepAppointmentDate, orgVision, orgMission, orgMainActivities, orgMemberCount
      };

      const formData = new FormData();
      formData.append('user_id', user.id);
      formData.append('applicant_type', applicantType);
      formData.append('profile_title', profileTitle);
      formData.append('profile_text', profileText);
      formData.append('profile_data', JSON.stringify(rawProfileData));

      // Append Government picked files if they are not null
      if (applicantType === 'Government') {
        if (govtFileDecree) {
          formData.append('file_decree', {
            uri: govtFileDecree.uri,
            name: govtFileDecree.name,
            type: govtFileDecree.mimeType || 'application/octet-stream'
          });
        }
        if (govtFileAppoint) {
          formData.append('file_appoint', {
            uri: govtFileAppoint.uri,
            name: govtFileAppoint.name,
            type: govtFileAppoint.mimeType || 'application/octet-stream'
          });
        }
        if (govtFileNpwp) {
          formData.append('file_npwp', {
            uri: govtFileNpwp.uri,
            name: govtFileNpwp.name,
            type: govtFileNpwp.mimeType || 'application/octet-stream'
          });
        }
        if (govtFileOther) {
          formData.append('file_other', {
            uri: govtFileOther.uri,
            name: govtFileOther.name,
            type: govtFileOther.mimeType || 'application/octet-stream'
          });
        }
      } 
      // Append Organization picked files if they are not null
      else if (applicantType === 'Organization') {
        if (orgFileDeed) {
          formData.append('file_deed', {
            uri: orgFileDeed.uri,
            name: orgFileDeed.name,
            type: orgFileDeed.mimeType || 'application/octet-stream'
          });
        }
        if (orgFileAmendment) {
          formData.append('file_amendment', {
            uri: orgFileAmendment.uri,
            name: orgFileAmendment.name,
            type: orgFileAmendment.mimeType || 'application/octet-stream'
          });
        }
        if (orgFileMinistry) {
          formData.append('file_ministry', {
            uri: orgFileMinistry.uri,
            name: orgFileMinistry.name,
            type: orgFileMinistry.mimeType || 'application/octet-stream'
          });
        }
        if (orgFileNpwp) {
          formData.append('file_npwp', {
            uri: orgFileNpwp.uri,
            name: orgFileNpwp.name,
            type: orgFileNpwp.mimeType || 'application/octet-stream'
          });
        }
        if (orgFileAdart) {
          formData.append('file_adart', {
            uri: orgFileAdart.uri,
            name: orgFileAdart.name,
            type: orgFileAdart.mimeType || 'application/octet-stream'
          });
        }
        if (orgFilePoa) {
          formData.append('file_poa', {
            uri: orgFilePoa.uri,
            name: orgFilePoa.name,
            type: orgFilePoa.mimeType || 'application/octet-stream'
          });
        }
      }

      const response = await fetch(`${CLIENT_PROFILE_API_URL}?action=save`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      const resData = await response.json();
      if (resData.status !== 'success') {
        Alert.alert("Save Failed", resData.message || "Failed to save client profile to database.");
        setLoading(false);
        return;
      }
      
      const newDoc = {
        id: 'doc-db-' + resData.profile_id,
        type: 'client_profile',
        title: profileTitle,
        date: new Date().toISOString().split('T')[0],
        status: 'Completed',
        data: {
          ...rawProfileData,
          applicantType,
          govtFileDecree, govtFileAppoint, govtFileNpwp, govtFileOther,
          orgFileDeed, orgFileAmendment, orgFileMinistry, orgFileNpwp, orgFileAdart, orgFilePoa
        },
        content: profileText
      };

      const updatedHistory = [newDoc, ...historyItems];
      const storageKey = user ? `generated_documents_${user.id}` : 'generated_documents_guest';
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedHistory));
      setHistoryItems(updatedHistory);

      Alert.alert(
        "Profile Saved!",
        "Client Legal Profile has been generated and saved to Database successfully.",
        [{ text: "View in History", onPress: () => setCurrentView('history') }]
      );
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to save client profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = () => {
    if (!newMemberName || !newMemberPosition || !newMemberNik) {
      Alert.alert("Fields Required", "Please enter at least the Member Name, Position, and NIK.");
      return;
    }
    if (newMemberNik.length !== 16 || isNaN(newMemberNik)) {
      Alert.alert("Invalid NIK", "Member NIK must be exactly 16 numeric digits.");
      return;
    }

    const member = {
      id: 'member-' + Date.now(),
      name: newMemberName,
      position: newMemberPosition,
      nik: newMemberNik,
      email: newMemberEmail,
      phone: newMemberPhone
    };

    setOrgMembers([...orgMembers, member]);
    
    // Reset fields
    setNewMemberName('');
    setNewMemberPosition('');
    setNewMemberNik('');
    setNewMemberEmail('');
    setNewMemberPhone('');
    setShowAddMemberForm(false);
  };

  const handleRemoveMember = (id) => {
    setOrgMembers(orgMembers.filter(m => m.id !== id));
  };

  const handleKtpAddressChange = (text) => {
    setEmployeeKtpAddress(text);
    if (sameAsKtp) {
      setEmployeeCurrentAddress(text);
    }
  };

  const handleAddPaymentStage = () => {
    if (!newStageName || !newStageAmount) {
      Alert.alert("Fields Required", "Please enter at least the Stage Name and Amount.");
      return;
    }
    const newStage = {
      id: 'stage-' + Date.now(),
      stageName: newStageName,
      amount: newStageAmount,
      dueDate: newStageDueDate,
      trigger: newStageTrigger
    };
    setPaymentStages([...paymentStages, newStage]);
    setNewStageName('');
    setNewStageAmount('');
    setNewStageDueDate('');
    setNewStageTrigger('');
    setShowAddStageForm(false);
  };

  const handleRemovePaymentStage = (id) => {
    setPaymentStages(paymentStages.filter(s => s.id !== id));
  };

  const renderContractStep = () => {
    if (currentStep === 1) {
      return (
        <View style={styles.formSection}>
          <Text style={styles.stepTitle}>General Info & Parties</Text>
          <Text style={styles.stepSub}>Configure contract identification and define legal parties.</Text>

          {/* Card 1: General Info */}
          <View style={styles.wizardCard}>
            <View style={styles.wizardCardHeader}>
              <Ionicons name="information-circle-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
              <Text style={styles.wizardCardTitle}>General Contract Information</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Contract Title *</Text>
              <View style={styles.inputContainer}>
                <TextInput style={styles.input} value={contractTitle} onChangeText={setContractTitle} placeholder="e.g. Service Level Agreement" placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Contract Number *</Text>
              <View style={styles.inputContainer}>
                <TextInput style={styles.input} value={contractNumber} onChangeText={setContractNumber} placeholder="e.g. 102/LAWSY/V/2026" placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Contract Date *</Text>
              <TouchableOpacity style={styles.inputContainer} onPress={() => openDatePicker('contractDate', contractDate)}>
                <Text style={[styles.input, !contractDate && { color: Theme.colors.placeholder }]}>
                  {contractDate || 'Select Contract Date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#888888" style={{ marginRight: 10 }} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Effective Date *</Text>
              <TouchableOpacity style={styles.inputContainer} onPress={() => openDatePicker('effectiveDate', effectiveDate)}>
                <Text style={[styles.input, !effectiveDate && { color: Theme.colors.placeholder }]}>
                  {effectiveDate || 'Select Effective Date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#888888" style={{ marginRight: 10 }} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Expiration Date</Text>
              <TouchableOpacity style={styles.inputContainer} onPress={() => openDatePicker('expirationDate', expirationDate)}>
                <Text style={[styles.input, !expirationDate && { color: Theme.colors.placeholder }]}>
                  {expirationDate || 'Select Expiration Date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#888888" style={{ marginRight: 10 }} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Governing Law</Text>
              <View style={styles.inputContainer}>
                <TextInput style={styles.input} value={governingLaw} onChangeText={setGoverningLaw} placeholder="e.g. Republic of Indonesia" placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Contract Language</Text>
              <View style={styles.inputContainer}>
                <TextInput style={styles.input} value={contractLanguage} onChangeText={setContractLanguage} placeholder="e.g. Bilingual (Indonesian/English)" placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>
          </View>

          {/* Card 2: Para Pihak */}
          <View style={styles.wizardCard}>
            <View style={styles.wizardCardHeader}>
              <Ionicons name="people-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
              <Text style={styles.wizardCardTitle}>Parties</Text>
            </View>

            {/* First Party Capsule Selector */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>First Party *</Text>
              <View style={[styles.inputContainer, { height: 'auto', paddingVertical: 6, backgroundColor: '#FAFAFA' }]}>
                {clientProfiles.length === 0 ? (
                  <Text style={[styles.uploadSubtext, { fontStyle: 'italic' }]}>No profiles saved. Please save client profile first.</Text>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {clientProfiles.map((p) => (
                        <TouchableOpacity
                          key={p.id}
                          style={[
                            styles.scopeOption,
                            firstPartyProfileId === p.id && styles.scopeOptionActive,
                            { paddingVertical: 8, paddingHorizontal: 12 }
                          ]}
                          onPress={() => setFirstPartyProfileId(p.id)}
                        >
                          <Text style={[
                            styles.scopeOptionText,
                            firstPartyProfileId === p.id && styles.scopeOptionTextActive
                          ]}>{p.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                )}
              </View>
            </View>

            {/* Second Party Capsule Selector */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Second Party *</Text>
              <View style={[styles.inputContainer, { height: 'auto', paddingVertical: 6, backgroundColor: '#FAFAFA' }]}>
                {clientProfiles.length === 0 ? (
                  <Text style={[styles.uploadSubtext, { fontStyle: 'italic' }]}>No profiles saved. Please save client profile first.</Text>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {clientProfiles.map((p) => (
                        <TouchableOpacity
                          key={p.id}
                          style={[
                            styles.scopeOption,
                            secondPartyProfileId === p.id && styles.scopeOptionActive,
                            { paddingVertical: 8, paddingHorizontal: 12 }
                          ]}
                          onPress={() => {
                            setSecondPartyProfileId(p.id);
                            setSecondPartyName(p.name);
                            setSecondPartyAddress(p.address);
                            setSecondPartyIdNo(p.identifier_no);
                          }}
                        >
                          <Text style={[
                            styles.scopeOptionText,
                            secondPartyProfileId === p.id && styles.scopeOptionTextActive
                          ]}>{p.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                )}
              </View>
            </View>
          </View>
        </View>
      );
    }

    if (currentStep === 2) {
      return (
        <View style={styles.formSection}>
          <Text style={styles.stepTitle}>Scope of Work</Text>
          <Text style={styles.stepSub}>Outline specific objectives, responsibilities, and deliverables.</Text>

          <View style={styles.wizardCard}>
            <View style={styles.wizardCardHeader}>
              <Ionicons name="document-text-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
              <Text style={styles.wizardCardTitle}>Scope Parameters</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Contract Purpose *</Text>
              <View style={[styles.inputContainer, { minHeight: 60, height: 'auto', paddingVertical: 8, alignItems: 'flex-start' }]}>
                <TextInput style={[styles.input, { textAlignVertical: 'top' }]} value={contractPurpose} onChangeText={setContractPurpose} placeholder="Purpose of this Agreement" multiline placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Background (Context)</Text>
              <View style={[styles.inputContainer, { minHeight: 60, height: 'auto', paddingVertical: 8, alignItems: 'flex-start' }]}>
                <TextInput style={[styles.input, { textAlignVertical: 'top' }]} value={contractBackground} onChangeText={setContractBackground} placeholder="Background details or introductory recitals..." multiline placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Scope of Work *</Text>
              <View style={[styles.inputContainer, { minHeight: 70, height: 'auto', paddingVertical: 8, alignItems: 'flex-start' }]}>
                <TextInput style={[styles.input, { textAlignVertical: 'top' }]} value={scopeOfWork} onChangeText={setScopeOfWork} placeholder="Detailed works or service parameters..." multiline placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Deliverables *</Text>
              <View style={[styles.inputContainer, { minHeight: 60, height: 'auto', paddingVertical: 8, alignItems: 'flex-start' }]}>
                <TextInput style={[styles.input, { textAlignVertical: 'top' }]} value={deliverables} onChangeText={setDeliverables} placeholder="Deliverables and schedule dates..." multiline placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>
          </View>

          <View style={styles.wizardCard}>
            <View style={styles.wizardCardHeader}>
              <Ionicons name="shield-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
              <Text style={styles.wizardCardTitle}>Responsibilities</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Responsibilities of First Party</Text>
              <View style={[styles.inputContainer, { minHeight: 60, height: 'auto', paddingVertical: 8, alignItems: 'flex-start' }]}>
                <TextInput style={[styles.input, { textAlignVertical: 'top' }]} value={responsibilitiesFirst} onChangeText={setResponsibilitiesFirst} placeholder="e.g. Provide access to data, give feedback..." multiline placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Responsibilities of Second Party</Text>
              <View style={[styles.inputContainer, { minHeight: 60, height: 'auto', paddingVertical: 8, alignItems: 'flex-start' }]}>
                <TextInput style={[styles.input, { textAlignVertical: 'top' }]} value={responsibilitiesSecond} onChangeText={setResponsibilitiesSecond} placeholder="e.g. Perform tasks with high standards, respect timeline..." multiline placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>
          </View>
        </View>
      );
    }

    if (currentStep === 3) {
      return (
        <View style={styles.formSection}>
          <Text style={styles.stepTitle}>Nilai Kontrak</Text>
          <Text style={styles.stepSub}>Configure contract amount, currency, tax parameters, and payment stages.</Text>

          {/* Card 1: Value Details */}
          <View style={styles.wizardCard}>
            <View style={styles.wizardCardHeader}>
              <Ionicons name="cash-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
              <Text style={styles.wizardCardTitle}>Value Parameters</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Currency *</Text>
              <View style={styles.segmentPickerRow}>
                {['IDR (Rp)', 'USD ($)'].map((curr) => (
                  <TouchableOpacity 
                    key={curr} 
                    style={[styles.segmentPickerBtn, contractCurrency === curr && styles.segmentPickerBtnActive]} 
                    onPress={() => setContractCurrency(curr)}
                  >
                    <Text style={[styles.segmentPickerText, contractCurrency === curr && styles.segmentPickerTextActive]}>{curr}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Contract Value *</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencyPrefix}>{contractCurrency === 'IDR (Rp)' ? 'Rp' : '$'}</Text>
                <TextInput style={styles.input} value={contractValue} onChangeText={setContractValue} placeholder="e.g. 50,000,000" keyboardType="numeric" placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>

            {/* Tax Checkbox */}
            <View style={styles.checkboxRowWrapper}>
              <TouchableOpacity 
                style={styles.checkboxRow} 
                onPress={() => setTaxIncluded(!taxIncluded)}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name={taxIncluded ? "checkbox" : "square-outline"} 
                  size={20} 
                  color={Theme.colors.primary} 
                />
                <Text style={styles.checkboxLabel}>Tax Included?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Payment Method *</Text>
              <View style={styles.inputContainer}>
                <TextInput style={styles.input} value={paymentMethod} onChangeText={setPaymentMethod} placeholder="e.g. Bank Transfer, LC, Escrow" placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>
          </View>

          {/* Card 2: Jadwal Pembayaran - Multiple Entries */}
          <View style={styles.wizardCard}>
            <View style={styles.wizardCardHeader}>
              <Ionicons name="calendar-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
              <Text style={styles.wizardCardTitle}>Payment Schedule</Text>
            </View>

            {/* List current stages */}
            {paymentStages.map((stage, idx) => (
              <View key={stage.id} style={styles.memberCard}>
                <View style={styles.memberHeader}>
                  <Text style={styles.memberName}>Stage {idx + 1}: {stage.stageName}</Text>
                  <TouchableOpacity onPress={() => handleRemovePaymentStage(stage.id)}>
                    <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.memberPosition}>Amount: {contractCurrency === 'IDR (Rp)' ? 'Rp ' : '$ '}{stage.amount}</Text>
                <Text style={styles.memberNik}>Due Date: {stage.dueDate || 'N/A'}</Text>
                <Text style={styles.memberNik}>Trigger: {stage.trigger || 'On demand'}</Text>
              </View>
            ))}

            {paymentStages.length === 0 && (
              <Text style={[styles.uploadSubtext, { fontStyle: 'italic', marginBottom: 15 }]}>No payment schedule stages defined yet (defaults to single payment).</Text>
            )}

            {/* Dynamic add form drawer */}
            {!showAddStageForm ? (
              <TouchableOpacity 
                style={[styles.wizardButton, styles.prevButton, { height: 40, marginTop: 10 }]} 
                onPress={() => setShowAddStageForm(true)}
              >
                <Text style={styles.prevButtonText}>+ Add Payment Stage</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.addMemberBox}>
                <View style={styles.addMemberHeader}>
                  <Text style={styles.addMemberTitle}>Payment Stage Details</Text>
                  <TouchableOpacity onPress={() => setShowAddStageForm(false)}>
                    <Text style={{ color: '#FF3B30', fontSize: 13, fontFamily: Theme.fonts.bold }}>Cancel</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Stage Name *</Text>
                  <View style={styles.inputContainer}>
                    <TextInput style={styles.input} value={newStageName} onChangeText={setNewStageName} placeholder="e.g. Down Payment (30%)" placeholderTextColor={Theme.colors.placeholder} />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Amount *</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.currencyPrefix}>{contractCurrency === 'IDR (Rp)' ? 'Rp' : '$'}</Text>
                    <TextInput style={styles.input} value={newStageAmount} onChangeText={setNewStageAmount} placeholder="e.g. 15,000,000" keyboardType="numeric" placeholderTextColor={Theme.colors.placeholder} />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Due Date</Text>
                  <TouchableOpacity style={styles.inputContainer} onPress={() => openDatePicker('newStageDueDate', newStageDueDate)}>
                    <Text style={[styles.input, !newStageDueDate && { color: Theme.colors.placeholder }]}>
                      {newStageDueDate || 'Select Due Date (Optional)'}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#888888" style={{ marginRight: 10 }} />
                  </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Payment Trigger</Text>
                  <View style={styles.inputContainer}>
                    <TextInput style={styles.input} value={newStageTrigger} onChangeText={setNewStageTrigger} placeholder="e.g. Upon signing, On project completion" placeholderTextColor={Theme.colors.placeholder} />
                  </View>
                </View>

                <TouchableOpacity style={[styles.continueButton, { height: 44, marginTop: 10 }]} onPress={handleAddPaymentStage}>
                  <Text style={styles.continueButtonText}>Save Stage Entry</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      );
    }

    if (currentStep === 4) {
      return (
        <View style={styles.formSection}>
          <Text style={styles.stepTitle}>Duration & Clauses</Text>
          <Text style={styles.stepSub}>Define contract durations and select active additional clauses.</Text>

          {/* Card 1: Jangka Waktu */}
          <View style={styles.wizardCard}>
            <View style={styles.wizardCardHeader}>
              <Ionicons name="time-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
              <Text style={styles.wizardCardTitle}>Contract Duration</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Start Date *</Text>
              <TouchableOpacity style={styles.inputContainer} onPress={() => openDatePicker('contractStartDate', contractStartDate)}>
                <Text style={[styles.input, !contractStartDate && { color: Theme.colors.placeholder }]}>
                  {contractStartDate || 'Select Start Date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#888888" style={{ marginRight: 10 }} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>End Date *</Text>
              <TouchableOpacity style={styles.inputContainer} onPress={() => openDatePicker('contractEndDate', contractEndDate)}>
                <Text style={[styles.input, !contractEndDate && { color: Theme.colors.placeholder }]}>
                  {contractEndDate || 'Select End Date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#888888" style={{ marginRight: 10 }} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Renewal Option</Text>
              <View style={styles.inputContainer}>
                <TextInput style={styles.input} value={renewalOption} onChangeText={setRenewalOption} placeholder="e.g. Automatically renewed for 1 year" placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>
          </View>

          {/* Card 2: Klausul Tambahan Checkboxes */}
          <View style={styles.wizardCard}>
            <View style={styles.wizardCardHeader}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
              <Text style={styles.wizardCardTitle}>Additional Clauses</Text>
            </View>

            <View style={{ gap: 12 }}>
              {[
                { key: 'confidentiality', label: 'Confidentiality' },
                { key: 'nonDisclosure', label: 'Non Disclosure' },
                { key: 'nonCompetition', label: 'Non Competition' },
                { key: 'intellectualProperty', label: 'Intellectual Property' },
                { key: 'forceMajeure', label: 'Force Majeure' },
                { key: 'termination', label: 'Termination' },
                { key: 'disputeResolution', label: 'Dispute Resolution' },
                { key: 'arbitration', label: 'Arbitration' },
                { key: 'governingLawClause', label: 'Governing Law' },
                { key: 'penaltyClause', label: 'Penalty Clause' },
              ].map((clauseItem) => (
                <TouchableOpacity 
                  key={clauseItem.key}
                  style={styles.checkboxRow} 
                  onPress={() => setClauses({ ...clauses, [clauseItem.key]: !clauses[clauseItem.key] })}
                  activeOpacity={0.8}
                >
                  <Ionicons 
                    name={clauses[clauseItem.key] ? "checkbox" : "square-outline"} 
                    size={20} 
                    color={Theme.colors.primary} 
                  />
                  <Text style={styles.checkboxLabel}>{clauseItem.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      );
    }

    if (currentStep === 5) {
      return (
        <View style={styles.formSection}>
          <Text style={styles.stepTitle}>Attachments & Signatures</Text>
          <Text style={styles.stepSub}>Attach supporting files and configure signature execution.</Text>

          {/* Card 1: Supporting Attachments using RealUploadField */}
          <View style={styles.wizardCard}>
            <View style={styles.wizardCardHeader}>
              <Ionicons name="document-attach-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
              <Text style={styles.wizardCardTitle}>Attachments (Real Uploads)</Text>
            </View>
            <RealUploadField label="Supporting Documents" value={fileSupporting} onChange={setFileSupporting} />
            <RealUploadField label="Technical Specifications" value={fileTechnical} onChange={setFileTechnical} />
            <RealUploadField label="Quotation" value={fileQuotation} onChange={setFileQuotation} />
            <RealUploadField label="Invoice" value={fileInvoice} onChange={setFileInvoice} />
          </View>

          {/* Card 2: Signatures details */}
          <View style={styles.wizardCard}>
            <View style={styles.wizardCardHeader}>
              <Ionicons name="create-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
              <Text style={styles.wizardCardTitle}>Signatures</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>First Party Signatory Name *</Text>
              <View style={styles.inputContainer}>
                <TextInput style={styles.input} value={signatoryName} onChangeText={setSignatoryName} placeholder="First Party Signatory Name" placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>First Party Signatory Position *</Text>
              <View style={styles.inputContainer}>
                <TextInput style={styles.input} value={signatoryPosition} onChangeText={setSignatoryPosition} placeholder="e.g. Director, President Commissioner" placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Signature Method *</Text>
              <View style={styles.segmentPickerRow}>
                {['E-Signature', 'Wet Signature'].map((method) => (
                  <TouchableOpacity 
                    key={method} 
                    style={[styles.segmentPickerBtn, signatureMethod === method && styles.segmentPickerBtnActive]} 
                    onPress={() => setSignatureMethod(method)}
                  >
                    <Text style={[styles.segmentPickerText, signatureMethod === method && styles.segmentPickerTextActive]}>{method}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Witness 1 Name</Text>
              <View style={styles.inputContainer}>
                <TextInput style={styles.input} value={witnessName1} onChangeText={setWitnessName1} placeholder="Optional Witness Name 1" placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Witness 2 Name</Text>
              <View style={styles.inputContainer}>
                <TextInput style={styles.input} value={witnessName2} onChangeText={setWitnessName2} placeholder="Optional Witness Name 2" placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>
          </View>
        </View>
      );
    }

    return renderPreviewStep();
  };

  const renderStatementStep = () => {
    if (currentStep === 1) {
      return (
        <View style={styles.formSection}>
          <Text style={styles.stepTitle}>General & Declarant Details</Text>
          <Text style={styles.stepSub}>Select the statement classification, declarant credentials, and destination.</Text>

          {/* Card 1: Jenis Pernyataan */}
          <View style={styles.wizardCard}>
            <View style={styles.wizardCardHeader}>
              <Ionicons name="bookmarks-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
              <Text style={styles.wizardCardTitle}>Statement Classification</Text>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Statement Type *</Text>
              <TouchableOpacity 
                style={styles.inputContainer} 
                onPress={() => setShowStatementTypeDropdown(!showStatementTypeDropdown)}
              >
                <Text style={styles.input}>{statementType}</Text>
                <Ionicons name={showStatementTypeDropdown ? "chevron-up" : "chevron-down"} size={20} color="#888888" style={{ marginRight: 10 }} />
              </TouchableOpacity>
              
              {showStatementTypeDropdown && (
                <View style={styles.dropdownList}>
                  {[
                    'Statement of Truth',
                    'Statement of Ownership',
                    'Statement of Responsibility',
                    'Debt Acknowledgement',
                    'No Objection Statement',
                    'Employment Statement',
                    'Income Statement',
                    'Asset Ownership Statement',
                    'Academic Statement',
                    'Other'
                  ].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.dropdownItem, statementType === type && styles.dropdownItemActive]}
                      onPress={() => {
                        setStatementType(type);
                        setShowStatementTypeDropdown(false);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, statementType === type && styles.dropdownItemTextActive]}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {statementType === 'Other' && (
              <View style={[styles.formGroup, { marginTop: 10 }]}>
                <Text style={styles.label}>Specify Custom Statement Type *</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={otherStatementType}
                    onChangeText={setOtherStatementType}
                    placeholder="e.g. Health Statement"
                    placeholderTextColor={Theme.colors.placeholder}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Card 2: Data Pembuat Pernyataan */}
          <View style={styles.wizardCard}>
            <View style={styles.wizardCardHeader}>
              <Ionicons name="person-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
              <Text style={styles.wizardCardTitle}>Declarant Details</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <View style={styles.inputContainer}>
                <TextInput style={styles.input} value={declarantName} onChangeText={setDeclarantName} placeholder="Declarant Full Name" placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>NIK *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={declarantId}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9]/g, '');
                    if (cleaned.length <= 16) setDeclarantId(cleaned);
                  }}
                  maxLength={16}
                  keyboardType="numeric"
                  placeholder="16-digit ID Card"
                  placeholderTextColor={Theme.colors.placeholder}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Address *</Text>
              <View style={[styles.inputContainer, { minHeight: 60, height: 'auto', paddingVertical: 8, alignItems: 'flex-start' }]}>
                <TextInput style={[styles.input, { textAlignVertical: 'top' }]} value={declarantAddress} onChangeText={setDeclarantAddress} placeholder="Full Address" multiline placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Occupation *</Text>
              <View style={styles.inputContainer}>
                <TextInput style={styles.input} value={declarantOccupation} onChangeText={setDeclarantOccupation} placeholder="e.g. Civil Servant, Entrepreneur" placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>
          </View>

          {/* Card 3: Tujuan Surat */}
          <View style={styles.wizardCard}>
            <View style={styles.wizardCardHeader}>
              <Ionicons name="send-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
              <Text style={styles.wizardCardTitle}>Recipient Destination</Text>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Select Destination Recipient *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
                  {['Bank', 'Court', 'University', 'Employer', 'Government', 'Personal'].map((dest) => (
                    <TouchableOpacity
                      key={dest}
                      style={[
                        styles.scopeOption,
                        statementDestination === dest && styles.scopeOptionActive,
                        { paddingVertical: 8, paddingHorizontal: 16 }
                      ]}
                      onPress={() => setStatementDestination(dest)}
                    >
                      <Text style={[
                        styles.scopeOptionText,
                        statementDestination === dest && styles.scopeOptionTextActive
                      ]}>{dest}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      );
    }

    if (currentStep === 2) {
      return (
        <View style={styles.formSection}>
          <Text style={styles.stepTitle}>Content, Witnesses & Notary</Text>
          <Text style={styles.stepSub}>Detail the statement matter, co-signing witnesses, and notarization toggles.</Text>

          {/* Card 1: Isi Pernyataan */}
          <View style={styles.wizardCard}>
            <View style={styles.wizardCardHeader}>
              <Ionicons name="document-text-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
              <Text style={styles.wizardCardTitle}>Statement Content</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Statement Subject *</Text>
              <View style={styles.inputContainer}>
                <TextInput style={styles.input} value={statementSubject} onChangeText={setStatementSubject} placeholder="e.g. Land ownership, Vehicle ownership, Debt" placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Statement Body Text *</Text>
              <View style={[styles.inputContainer, { height: 160, alignItems: 'flex-start' }]}>
                <TextInput
                  style={[styles.input, { height: '100%', textAlignVertical: 'top', paddingTop: 12 }]}
                  value={statementText}
                  onChangeText={setStatementText}
                  placeholder="I hereby declare under penalty of perjury that..."
                  multiline
                  placeholderTextColor={Theme.colors.placeholder}
                />
              </View>
            </View>
          </View>

          {/* Card 2: Detail Tambahan */}
          <View style={styles.wizardCard}>
            <View style={styles.wizardCardHeader}>
              <Ionicons name="calendar-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
              <Text style={styles.wizardCardTitle}>Additional Details</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Effective Date *</Text>
              <TouchableOpacity style={styles.inputContainer} onPress={() => openDatePicker('statementDate', statementDate)}>
                <Text style={[styles.input, !statementDate && { color: Theme.colors.placeholder }]}>
                  {statementDate || 'Select Effective Date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#888888" style={{ marginRight: 10 }} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Expiration Date</Text>
              <TouchableOpacity style={styles.inputContainer} onPress={() => openDatePicker('statementExpiryDate', statementExpiryDate)}>
                <Text style={[styles.input, !statementExpiryDate && { color: Theme.colors.placeholder }]}>
                  {statementExpiryDate || 'Optional Expiry Date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#888888" style={{ marginRight: 10 }} />
              </TouchableOpacity>
            </View>

            <RealUploadField label="Supporting Evidence (Attachment)" value={fileEvidence} onChange={setFileEvidence} />
          </View>

          {/* Card 3: Saksi */}
          <View style={styles.wizardCard}>
            <View style={styles.wizardCardHeader}>
              <Ionicons name="people-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
              <Text style={styles.wizardCardTitle}>Witnesses List</Text>
            </View>

            {statementWitnesses.map((w, idx) => (
              <View key={w.id} style={styles.memberCard}>
                <View style={styles.memberHeader}>
                  <Text style={styles.memberName}>Witness {idx + 1}: {w.name}</Text>
                  <TouchableOpacity onPress={() => handleRemoveWitness(w.id)}>
                    <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.memberPosition}>NIK: {w.nik}</Text>
                <Text style={styles.memberNik}>Address: {w.address}</Text>
              </View>
            ))}

            {statementWitnesses.length === 0 && (
              <Text style={[styles.uploadSubtext, { fontStyle: 'italic', marginBottom: 15 }]}>No witnesses added yet (standard statement continues without co-signers).</Text>
            )}

            {!showAddWitnessForm ? (
              <TouchableOpacity 
                style={[styles.wizardButton, styles.prevButton, { height: 40, marginTop: 10 }]} 
                onPress={() => setShowAddWitnessForm(true)}
              >
                <Text style={styles.prevButtonText}>+ Add Witness</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.addMemberBox}>
                <View style={styles.addMemberHeader}>
                  <Text style={styles.addMemberTitle}>Witness Details</Text>
                  <TouchableOpacity onPress={() => setShowAddWitnessForm(false)}>
                    <Text style={{ color: '#FF3B30', fontSize: 13, fontFamily: Theme.fonts.bold }}>Cancel</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Full Name *</Text>
                  <View style={styles.inputContainer}>
                    <TextInput style={styles.input} value={newWitnessName} onChangeText={setNewWitnessName} placeholder="Witness Full Name" placeholderTextColor={Theme.colors.placeholder} />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>NIK *</Text>
                  <View style={styles.inputContainer}>
                    <TextInput 
                      style={styles.input} 
                      value={newWitnessNik} 
                      onChangeText={(text) => {
                        const cleaned = text.replace(/[^0-9]/g, '');
                        if (cleaned.length <= 16) setNewWitnessNik(cleaned);
                      }}
                      maxLength={16}
                      keyboardType="numeric"
                      placeholder="16-digit ID Card" 
                      placeholderTextColor={Theme.colors.placeholder} 
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Address *</Text>
                  <View style={styles.inputContainer}>
                    <TextInput style={styles.input} value={newWitnessAddress} onChangeText={setNewWitnessAddress} placeholder="Witness's Address" placeholderTextColor={Theme.colors.placeholder} />
                  </View>
                </View>

                <TouchableOpacity style={[styles.continueButton, { height: 44, marginTop: 10 }]} onPress={handleAddWitness}>
                  <Text style={styles.continueButtonText}>Save Witness Entry</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Card 4: Notarization */}
          <View style={styles.wizardCard}>
            <View style={styles.wizardCardHeader}>
              <Ionicons name="ribbon-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
              <Text style={styles.wizardCardTitle}>Notarization Seal</Text>
            </View>

            <View style={styles.checkboxRowWrapper}>
              <TouchableOpacity 
                style={styles.checkboxRow} 
                onPress={() => setNeedNotary(!needNotary)}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name={needNotary ? "checkbox" : "square-outline"} 
                  size={20} 
                  color={Theme.colors.primary} 
                />
                <Text style={styles.checkboxLabel}>Require Notary Certification?</Text>
              </TouchableOpacity>
            </View>

            {needNotary && (
              <View style={{ marginTop: 15, borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 15 }}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Notary Name *</Text>
                  <View style={styles.inputContainer}>
                    <TextInput style={styles.input} value={notaryName} onChangeText={setNeedNotary ? setNotaryName : null} placeholder="Notary Legal Name, S.H., M.Kn." placeholderTextColor={Theme.colors.placeholder} />
                  </View>
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Notary Office Address *</Text>
                  <View style={[styles.inputContainer, { minHeight: 60, height: 'auto', paddingVertical: 8, alignItems: 'flex-start' }]}>
                    <TextInput style={[styles.input, { textAlignVertical: 'top' }]} value={notaryOffice} onChangeText={setNotaryOffice} placeholder="Notary office address..." multiline placeholderTextColor={Theme.colors.placeholder} />
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      );
    }

    return renderPreviewStep();
  };

  const renderPoaStep = () => {
    if (currentStep === 1) {
      return (
        <View style={styles.formSection}>
          <Text style={styles.stepTitle}>Authorizer & Attorney Details</Text>
          <Text style={styles.stepSub}>Enter credentials of the Authorizer (Grantor) and the Attorney.</Text>

          {/* Card 1: Jenis Kuasa */}
          <View style={styles.wizardCard}>
            <View style={styles.wizardCardHeader}>
              <Ionicons name="bookmarks-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
              <Text style={styles.wizardCardTitle}>Power of Attorney Classification</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Power of Attorney Type *</Text>
              <TouchableOpacity 
                style={styles.inputContainer} 
                onPress={() => setShowPoaTypeDropdown(!showPoaTypeDropdown)}
              >
                <Text style={styles.input}>{poaType}</Text>
                <Ionicons name={showPoaTypeDropdown ? "chevron-up" : "chevron-down"} size={20} color="#888888" style={{ marginRight: 10 }} />
              </TouchableOpacity>

              {showPoaTypeDropdown && (
                <View style={styles.dropdownList}>
                  {[
                    'General Power of Attorney',
                    'Special Power of Attorney',
                    'Litigation',
                    'Property Sale',
                    'Property Purchase',
                    'Vehicle Sale',
                    'Banking',
                    'Tax',
                    'Debt Collection',
                    'Employment',
                    'Immigration',
                    'Corporate',
                    'Court Representation',
                    'Other'
                  ].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.dropdownItem, poaType === type && styles.dropdownItemActive]}
                      onPress={() => {
                        setPoaType(type);
                        setShowPoaTypeDropdown(false);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, poaType === type && styles.dropdownItemTextActive]}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {poaType === 'Other' && (
              <View style={[styles.formGroup, { marginTop: 10 }]}>
                <Text style={styles.label}>Specify Custom POA Type *</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={otherPoaType}
                    onChangeText={setOtherPoaType}
                    placeholder="e.g. Intellectual Property Representation"
                    placeholderTextColor={Theme.colors.placeholder}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Card 2: Pemberi Kuasa */}
          <View style={styles.wizardCard}>
            <View style={styles.wizardCardHeader}>
              <Ionicons name="person-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
              <Text style={styles.wizardCardTitle}>Authorizer Details</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <View style={styles.inputContainer}>
                <TextInput style={styles.input} value={authorizerName} onChangeText={setAuthorizerName} placeholder="Authorizer's Name" placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>NIK / ID Card *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={authorizerId}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9]/g, '');
                    if (cleaned.length <= 16) setAuthorizerId(cleaned);
                  }}
                  maxLength={16}
                  keyboardType="numeric"
                  placeholder="16-digit ID Card"
                  placeholderTextColor={Theme.colors.placeholder}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Address *</Text>
              <View style={[styles.inputContainer, { minHeight: 60, height: 'auto', paddingVertical: 8, alignItems: 'flex-start' }]}>
                <TextInput style={[styles.input, { textAlignVertical: 'top' }]} value={authorizerAddress} onChangeText={setAuthorizerAddress} placeholder="Authorizer's Address" multiline placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Occupation *</Text>
              <View style={styles.inputContainer}>
                <TextInput style={styles.input} value={authorizerOccupation} onChangeText={setAuthorizerOccupation} placeholder="e.g. Business Owner, Private Employee" placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>
          </View>

          {/* Card 3: Penerima Kuasa */}
          <View style={styles.wizardCard}>
            <View style={styles.wizardCardHeader}>
              <Ionicons name="briefcase-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
              <Text style={styles.wizardCardTitle}>Attorney Details</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <View style={styles.inputContainer}>
                <TextInput style={styles.input} value={attorneyName} onChangeText={setAttorneyName} placeholder="Attorney's Name" placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>NIK / ID Card *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={attorneyId}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9]/g, '');
                    if (cleaned.length <= 16) setAttorneyId(cleaned);
                  }}
                  maxLength={16}
                  keyboardType="numeric"
                  placeholder="16-digit ID Card"
                  placeholderTextColor={Theme.colors.placeholder}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>BAR License Number (Lawyer)</Text>
              <View style={styles.inputContainer}>
                <TextInput style={styles.input} value={attorneyBarLicense} onChangeText={setAttorneyBarLicense} placeholder="Optional BAR License Number" placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Law Firm Name</Text>
              <View style={styles.inputContainer}>
                <TextInput style={styles.input} value={attorneyLawFirm} onChangeText={setAttorneyLawFirm} placeholder="Optional Law Firm Name" placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Address *</Text>
              <View style={[styles.inputContainer, { minHeight: 60, height: 'auto', paddingVertical: 8, alignItems: 'flex-start' }]}>
                <TextInput style={[styles.input, { textAlignVertical: 'top' }]} value={attorneyAddress} onChangeText={setAttorneyAddress} placeholder="Attorney's Address" multiline placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <View style={styles.inputContainer}>
                <TextInput style={styles.input} value={attorneyEmail} onChangeText={setAttorneyEmail} keyboardType="email-address" placeholder="attorney@domain.com" placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <View style={styles.inputContainer}>
                <TextInput style={styles.input} value={attorneyPhone} onChangeText={setAttorneyPhone} keyboardType="phone-pad" placeholder="e.g. +628123456789" placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>
          </View>
        </View>
      );
    }

    if (currentStep === 2) {
      return (
        <View style={styles.formSection}>
          <Text style={styles.stepTitle}>Scope, Objects & Details</Text>
          <Text style={styles.stepSub}>Configure the authority parameters, conditional target objects, and validity.</Text>

          {/* Card 1: Ruang Lingkup Kuasa (Checkbox Multi Select) */}
          <View style={styles.wizardCard}>
            <View style={styles.wizardCardHeader}>
              <Ionicons name="checkbox-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
              <Text style={styles.wizardCardTitle}>Scope of Authority</Text>
            </View>

            <View style={{ gap: 12 }}>
              {[
                { key: 'signDocuments', label: 'Sign Documents' },
                { key: 'submitApplications', label: 'Submit Applications' },
                { key: 'representInCourt', label: 'Represent in Court' },
                { key: 'receivePayments', label: 'Receive Payments' },
                { key: 'openBankAccounts', label: 'Open Bank Accounts' },
                { key: 'withdrawFunds', label: 'Withdraw Funds' },
                { key: 'sellAssets', label: 'Sell Assets' },
                { key: 'purchaseAssets', label: 'Purchase Assets' },
                { key: 'signContracts', label: 'Sign Contracts' },
                { key: 'negotiateAgreements', label: 'Negotiate Agreements' },
                { key: 'fileComplaints', label: 'File Complaints' },
                { key: 'handleTaxMatters', label: 'Handle Tax Matters' },
              ].map((scopeItem) => (
                <TouchableOpacity 
                  key={scopeItem.key}
                  style={styles.checkboxRow} 
                  onPress={() => setPoaScopes({ ...poaScopes, [scopeItem.key]: !poaScopes[scopeItem.key] })}
                  activeOpacity={0.8}
                >
                  <Ionicons 
                    name={poaScopes[scopeItem.key] ? "checkbox" : "square-outline"} 
                    size={20} 
                    color={Theme.colors.primary} 
                  />
                  <Text style={styles.checkboxLabel}>{scopeItem.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Card 2: Batasan Kuasa */}
          <View style={styles.wizardCard}>
            <View style={styles.wizardCardHeader}>
              <Ionicons name="shield-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
              <Text style={styles.wizardCardTitle}>Limitations of Power</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Authorized Actions</Text>
              <View style={[styles.inputContainer, { minHeight: 60, height: 'auto', paddingVertical: 8, alignItems: 'flex-start' }]}>
                <TextInput style={[styles.input, { textAlignVertical: 'top' }]} value={poaAuthorizedActions} onChangeText={setPoaAuthorizedActions} placeholder="Actions explicitly authorized..." multiline placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Restricted Actions</Text>
              <View style={[styles.inputContainer, { minHeight: 60, height: 'auto', paddingVertical: 8, alignItems: 'flex-start' }]}>
                <TextInput style={[styles.input, { textAlignVertical: 'top' }]} value={poaRestrictedActions} onChangeText={setPoaRestrictedActions} placeholder="Actions explicitly forbidden/restricted..." multiline placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Maximum Transaction Value</Text>
              <View style={styles.inputContainer}>
                <TextInput 
                  style={styles.input} 
                  value={poaMaxTxValue} 
                  onChangeText={(val) => setPoaMaxTxValue(val.replace(/[^0-9.]/g, ''))} 
                  keyboardType="numeric" 
                  placeholder="e.g. 500000000" 
                  placeholderTextColor={Theme.colors.placeholder} 
                />
              </View>
            </View>
          </View>

          {/* Card 3: Objek Kuasa */}
          <View style={styles.wizardCard}>
            <View style={styles.wizardCardHeader}>
              <Ionicons name="cube-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
              <Text style={styles.wizardCardTitle}>Power of Attorney Object</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Object Type</Text>
              <View style={styles.segmentPickerRow}>
                {['None', 'Property', 'Vehicle'].map((objType) => (
                  <TouchableOpacity 
                    key={objType} 
                    style={[styles.segmentPickerBtn, poaObjectType === objType && styles.segmentPickerBtnActive]} 
                    onPress={() => setPoaObjectType(objType)}
                  >
                    <Text style={[styles.segmentPickerText, poaObjectType === objType && styles.segmentPickerTextActive]}>{objType}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={[styles.segmentPickerRow, { marginTop: 8 }]}>
                {['Company'].map((objType) => (
                  <TouchableOpacity 
                    key={objType} 
                    style={[styles.segmentPickerBtn, poaObjectType === objType && styles.segmentPickerBtnActive]} 
                    onPress={() => setPoaObjectType(objType)}
                  >
                    <Text style={[styles.segmentPickerText, poaObjectType === objType && styles.segmentPickerTextActive]}>{objType}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {poaObjectType === 'Property' && (
              <View style={{ borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 15, marginTop: 10 }}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Property Certificate Number *</Text>
                  <View style={styles.inputContainer}>
                    <TextInput style={styles.input} value={poaPropertyCertificate} onChangeText={setPoaPropertyCertificate} placeholder="SHM / SHGB No..." placeholderTextColor={Theme.colors.placeholder} />
                  </View>
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Property Address *</Text>
                  <View style={[styles.inputContainer, { minHeight: 60, height: 'auto', paddingVertical: 8, alignItems: 'flex-start' }]}>
                    <TextInput style={[styles.input, { textAlignVertical: 'top' }]} value={poaPropertyAddress} onChangeText={setPoaPropertyAddress} placeholder="Exact property address..." multiline placeholderTextColor={Theme.colors.placeholder} />
                  </View>
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Land Area (sqm)</Text>
                  <View style={styles.inputContainer}>
                    <TextInput style={styles.input} value={poaPropertyLandArea} onChangeText={(text) => setPoaPropertyLandArea(text.replace(/[^0-9]/g, ''))} keyboardType="numeric" placeholder="e.g. 150" placeholderTextColor={Theme.colors.placeholder} />
                  </View>
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Building Area (sqm)</Text>
                  <View style={styles.inputContainer}>
                    <TextInput style={styles.input} value={poaPropertyBuildingArea} onChangeText={(text) => setPoaPropertyBuildingArea(text.replace(/[^0-9]/g, ''))} keyboardType="numeric" placeholder="e.g. 200" placeholderTextColor={Theme.colors.placeholder} />
                  </View>
                </View>
              </View>
            )}

            {poaObjectType === 'Vehicle' && (
              <View style={{ borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 15, marginTop: 10 }}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Vehicle Type/Brand *</Text>
                  <View style={styles.inputContainer}>
                    <TextInput style={styles.input} value={poaVehicleType} onChangeText={setPoaVehicleType} placeholder="e.g. Toyota Alphard" placeholderTextColor={Theme.colors.placeholder} />
                  </View>
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Plate Number *</Text>
                  <View style={styles.inputContainer}>
                    <TextInput style={styles.input} value={poaVehiclePlate} onChangeText={setPoaVehiclePlate} placeholder="e.g. B 1234 ABC" placeholderTextColor={Theme.colors.placeholder} />
                  </View>
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Chassis Number *</Text>
                  <View style={styles.inputContainer}>
                    <TextInput style={styles.input} value={poaVehicleChassis} onChangeText={setPoaVehicleChassis} placeholder="Chassis Number" placeholderTextColor={Theme.colors.placeholder} />
                  </View>
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Engine Number *</Text>
                  <View style={styles.inputContainer}>
                    <TextInput style={styles.input} value={poaVehicleEngine} onChangeText={setPoaVehicleEngine} placeholder="Engine Number" placeholderTextColor={Theme.colors.placeholder} />
                  </View>
                </View>
              </View>
            )}

            {poaObjectType === 'Company' && (
              <View style={{ borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 15, marginTop: 10 }}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Company Name *</Text>
                  <View style={styles.inputContainer}>
                    <TextInput style={styles.input} value={poaCompanyName} onChangeText={setPoaCompanyName} placeholder="PT Company Name" placeholderTextColor={Theme.colors.placeholder} />
                  </View>
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Registration Number (NIB) *</Text>
                  <View style={styles.inputContainer}>
                    <TextInput style={styles.input} value={poaCompanyRegNo} onChangeText={setPoaCompanyRegNo} placeholder="Business Reg Number" placeholderTextColor={Theme.colors.placeholder} />
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Card 4: Masa Berlaku */}
          <View style={styles.wizardCard}>
            <View style={styles.wizardCardHeader}>
              <Ionicons name="calendar-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
              <Text style={styles.wizardCardTitle}>Validity Period</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Effective Date *</Text>
              <TouchableOpacity style={styles.inputContainer} onPress={() => openDatePicker('poaEffectiveDate', poaEffectiveDate)}>
                <Text style={[styles.input, !poaEffectiveDate && { color: Theme.colors.placeholder }]}>
                  {poaEffectiveDate || 'Select Effective Date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#888888" style={{ marginRight: 10 }} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Expiry Date</Text>
              <TouchableOpacity style={styles.inputContainer} onPress={() => openDatePicker('poaExpiryDate', poaExpiryDate)}>
                <Text style={[styles.input, !poaExpiryDate && { color: Theme.colors.placeholder }]}>
                  {poaExpiryDate || 'Optional Expiry Date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#888888" style={{ marginRight: 10 }} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Card 5: Hak Substitusi */}
          <View style={styles.wizardCard}>
            <View style={styles.wizardCardHeader}>
              <Ionicons name="arrow-redo-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
              <Text style={styles.wizardCardTitle}>Right of Substitution</Text>
            </View>

            <View style={styles.checkboxRowWrapper}>
              <TouchableOpacity 
                style={styles.checkboxRow} 
                onPress={() => setPoaAllowSubstitution(!poaAllowSubstitution)}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name={poaAllowSubstitution ? "checkbox" : "square-outline"} 
                  size={20} 
                  color={Theme.colors.primary} 
                />
                <Text style={styles.checkboxLabel}>Allow Substitution?</Text>
              </TouchableOpacity>
            </View>

            {poaAllowSubstitution && (
              <View style={[styles.formGroup, { marginTop: 10 }]}>
                <Text style={styles.label}>Substitution Conditions</Text>
                <View style={[styles.inputContainer, { minHeight: 60, height: 'auto', paddingVertical: 8, alignItems: 'flex-start' }]}>
                  <TextInput style={[styles.input, { textAlignVertical: 'top' }]} value={poaSubstituteConditions} onChangeText={setPoaSubstituteConditions} placeholder="e.g. Only to a registered attorney in the same firm..." multiline placeholderTextColor={Theme.colors.placeholder} />
                </View>
              </View>
            )}
          </View>

          {/* Card 6: Pencabutan Kuasa */}
          <View style={styles.wizardCard}>
            <View style={styles.wizardCardHeader}>
              <Ionicons name="close-circle-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
              <Text style={styles.wizardCardTitle}>Revocation of Power</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Revocation Conditions</Text>
              <View style={[styles.inputContainer, { minHeight: 60, height: 'auto', paddingVertical: 8, alignItems: 'flex-start' }]}>
                <TextInput style={[styles.input, { textAlignVertical: 'top' }]} value={poaRevocationConditions} onChangeText={setPoaRevocationConditions} placeholder="Revocation clauses or conditions..." multiline placeholderTextColor={Theme.colors.placeholder} />
              </View>
            </View>
          </View>
        </View>
      );
    }

    return renderPreviewStep();
  };

  // ==================== NEW: REAL FILE UPLOAD COMPONENT ====================
  const RealUploadField = ({ label, value, onChange }) => {
    const handlePickFile = async () => {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: ['application/pdf', 'image/*'],
          copyToCacheDirectory: true,
        });

        if (result.canceled) return;

        const file = result.assets[0];

        // 10MB Limit (as stated in UI: Max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Maximum file size is 10MB.');
          return;
        }

        onChange({
          name: file.name,
          uri: file.uri,
          mimeType: file.mimeType || 'application/octet-stream',
          size: file.size,
        });
      } catch (err) {
        console.error("Error picking document: ", err);
        Alert.alert('Error', 'Failed to pick document');
      }
    };

    return (
      <View style={styles.uploadGroup}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity 
          style={[
            styles.uploadBox, 
            value && styles.uploadBoxSuccess
          ]}
          onPress={() => {
            if (value) {
              onChange(null); // Remove
            } else {
              handlePickFile();
            }
          }}
          activeOpacity={0.8}
        >
          <Ionicons 
            name={value ? "checkmark-circle" : "cloud-upload-outline"} 
            size={22} 
            color={value ? "#2E7D32" : Theme.colors.primary} 
            style={{ marginRight: 10 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={[
              styles.uploadText,
              value && styles.uploadTextSuccess
            ]}>
              {value ? value.name : `Upload ${label}`}
            </Text>
            <Text style={styles.uploadSubtext}>
              {value ? `Size: ${(value.size / (1024 * 1024)).toFixed(2)} MB - Tap to remove` : "PDF, JPG, PNG (Max 10MB)"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // ==================== NEW: CLIENT PROFILE CARD FORMS ====================
  const renderIndividualForm = () => {
    return (
      <View>
        {/* Card 1: Basic Information */}
        <View style={styles.wizardCard}>
          <View style={styles.wizardCardHeader}>
            <Ionicons name="information-circle-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
            <Text style={styles.wizardCardTitle}>Basic Information</Text>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Client Full Name" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>

          {/* Gender Segment */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Gender *</Text>
            <View style={styles.segmentPickerRow}>
              {['Male', 'Female'].map((g) => (
                <TouchableOpacity 
                  key={g} 
                  style={[styles.segmentPickerBtn, gender === g && styles.segmentPickerBtnActive]} 
                  onPress={() => setGender(g)}
                >
                  <Text style={[styles.segmentPickerText, gender === g && styles.segmentPickerTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Place of Birth *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={placeOfBirth} onChangeText={setPlaceOfBirth} placeholder="City or Region" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date of Birth *</Text>
            <TouchableOpacity style={styles.inputContainer} onPress={() => openDatePicker('dateOfBirth', dateOfBirth)}>
              <Text style={[styles.input, !dateOfBirth && { color: Theme.colors.placeholder }]}>
                {dateOfBirth || 'Select Date of Birth'}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#888888" style={{ marginRight: 10 }} />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nationality *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={nationality} onChangeText={setNationality} placeholder="Nationality" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>

          {/* Marital Status Segment */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Marital Status *</Text>
            <View style={styles.segmentPickerRow}>
              {['Single', 'Married', 'Divorced'].map((m) => (
                <TouchableOpacity 
                  key={m} 
                  style={[styles.segmentPickerBtn, maritalStatus === m && styles.segmentPickerBtnActive]} 
                  onPress={() => setMaritalStatus(m)}
                >
                  <Text style={[styles.segmentPickerText, maritalStatus === m && styles.segmentPickerTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Card 2: Identity */}
        <View style={styles.wizardCard}>
          <View style={styles.wizardCardHeader}>
            <Ionicons name="id-card-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
            <Text style={styles.wizardCardTitle}>Identity Details</Text>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>NIK / National ID Number *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={nik}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  if (cleaned.length <= 16) setNik(cleaned);
                }}
                keyboardType="numeric"
                maxLength={16}
                placeholder="16-digit ID card number"
                placeholderTextColor={Theme.colors.placeholder}
              />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>NPWP (Tax ID Number)</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={npwp} onChangeText={setNpwp} placeholder="Tax Number" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
        </View>

        {/* Card 3: Contact */}
        <View style={styles.wizardCard}>
          <View style={styles.wizardCardHeader}>
            <Ionicons name="mail-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
            <Text style={styles.wizardCardTitle}>Contact</Text>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="email@client.com" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Phone Number" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Whatsapp Number</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" placeholder="Whatsapp Number" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
        </View>

        {/* Card 4: Address */}
        <View style={styles.wizardCard}>
          <View style={styles.wizardCardHeader}>
            <Ionicons name="location-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
            <Text style={styles.wizardCardTitle}>Address</Text>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Address *</Text>
            <View style={[styles.inputContainer, { minHeight: 60, height: 'auto', paddingVertical: 10, alignItems: 'flex-start' }]}>
              <TextInput style={[styles.input, { textAlignVertical: 'top' }]} value={address} onChangeText={setAddress} placeholder="Street Address" multiline placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>City *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="City" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Province *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={province} onChangeText={setProvince} placeholder="Province" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Postal Code *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={postalCode} onChangeText={setPostalCode} keyboardType="numeric" placeholder="Postal Code" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Country *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={country} onChangeText={setCountry} placeholder="Country" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
        </View>

        {/* Card 5: JOBS */}
        <View style={styles.wizardCard}>
          <View style={styles.wizardCardHeader}>
            <Ionicons name="briefcase-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
            <Text style={styles.wizardCardTitle}>JOBS</Text>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Occupation</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={occupation} onChangeText={setOccupation} placeholder="Occupation" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Employer</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={employer} onChangeText={setEmployer} placeholder="Employer / Company Name" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Job Title</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={clientJobTitle} onChangeText={setClientJobTitle} placeholder="Position" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderCompanyForm = () => {
    return (
      <View>
        {/* Card 1: Company Information */}
        <View style={styles.wizardCard}>
          <View style={styles.wizardCardHeader}>
            <Ionicons name="business-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
            <Text style={styles.wizardCardTitle}>Company Information</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Company Name *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={companyName} onChangeText={setCompanyName} placeholder="PT. Company Name" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Legal Entity Type *</Text>
            <View style={styles.segmentPickerRow}>
              {['PT', 'CV', 'Firm', 'Foundation'].map((letype) => (
                <TouchableOpacity 
                  key={letype} 
                  style={[styles.segmentPickerBtn, legalEntityType === letype && styles.segmentPickerBtnActive]} 
                  onPress={() => setLegalEntityType(letype)}
                >
                  <Text style={[styles.segmentPickerText, legalEntityType === letype && styles.segmentPickerTextActive]}>{letype}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Business Registration Number (NIB) *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={businessRegNo} onChangeText={setBusinessRegNo} placeholder="Business Registration Number" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Tax Number (NPWP) *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={companyNpwp} onChangeText={setCompanyNpwp} placeholder="Company NPWP" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date Established</Text>
            <TouchableOpacity style={styles.inputContainer} onPress={() => openDatePicker('dateEstablished', dateEstablished)}>
              <Text style={[styles.input, !dateEstablished && { color: Theme.colors.placeholder }]}>
                {dateEstablished || 'Select Date Established'}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#888888" style={{ marginRight: 10 }} />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Registered Address *</Text>
            <View style={[styles.inputContainer, { minHeight: 60, height: 'auto', paddingVertical: 10, alignItems: 'flex-start' }]}>
              <TextInput style={[styles.input, { textAlignVertical: 'top' }]} value={registeredAddress} onChangeText={setRegisteredAddress} placeholder="Official registered address" multiline placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Operational Address</Text>
            <View style={[styles.inputContainer, { minHeight: 60, height: 'auto', paddingVertical: 10, alignItems: 'flex-start' }]}>
              <TextInput style={[styles.input, { textAlignVertical: 'top' }]} value={operationalAddress} onChangeText={setOperationalAddress} placeholder="Operational address" multiline placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
        </View>

        {/* Card 2: Representative */}
        <View style={styles.wizardCard}>
          <View style={styles.wizardCardHeader}>
            <Ionicons name="person-circle-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
            <Text style={styles.wizardCardTitle}>Representative</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={repName} onChangeText={setRepName} placeholder="Representative's Name" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Position *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={repPositionState} onChangeText={setRepPositionState} placeholder="e.g. Director, President Commissioner" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>NIK / National ID Number *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={repNik}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  if (cleaned.length <= 16) setRepNik(cleaned);
                }}
                keyboardType="numeric"
                maxLength={16}
                placeholder="16-digit ID card number"
                placeholderTextColor={Theme.colors.placeholder}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Authority Basis *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={repAuthorityBasis} onChangeText={setRepAuthorityBasis} placeholder="e.g. Power of Attorney, Deed of Establishment" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderGovernmentForm = () => {
    return (
      <View>
        {/* Card 1: Informasi Instansi */}
        <View style={styles.wizardCard}>
          <View style={styles.wizardCardHeader}>
            <Ionicons name="business-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
            <Text style={styles.wizardCardTitle}>Institution Details</Text>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Institution Name *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={govtInstName} onChangeText={setGovtInstName} placeholder="e.g. Kementerian Hukum dan HAM" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Institution Type *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={govtInstType} onChangeText={setGovtInstType} placeholder="e.g. Kementerian, Lembaga Negara" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Ministry / Supervising Agency</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={govtSupervisingAgency} onChangeText={setGovtSupervisingAgency} placeholder="Supervising Ministry" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Government Level *</Text>
            <View style={styles.segmentPickerRow}>
              {['National', 'Provincial', 'City/Regency'].map((lvl) => (
                <TouchableOpacity 
                  key={lvl} 
                  style={[styles.segmentPickerBtn, govtLevel === lvl && styles.segmentPickerBtnActive]} 
                  onPress={() => setGovtLevel(lvl)}
                >
                  <Text style={[styles.segmentPickerText, govtLevel === lvl && styles.segmentPickerTextActive]}>{lvl}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={[styles.segmentPickerRow, { marginTop: 8 }]}>
              {['District', 'Village'].map((lvl) => (
                <TouchableOpacity 
                  key={lvl} 
                  style={[styles.segmentPickerBtn, govtLevel === lvl && styles.segmentPickerBtnActive]} 
                  onPress={() => setGovtLevel(lvl)}
                >
                  <Text style={[styles.segmentPickerText, govtLevel === lvl && styles.segmentPickerTextActive]}>{lvl}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Card 2: Nomor Registrasi */}
        <View style={styles.wizardCard}>
          <View style={styles.wizardCardHeader}>
            <Ionicons name="id-card-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
            <Text style={styles.wizardCardTitle}>Registration Details</Text>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Institution Registration Number *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={govtRegNo} onChangeText={setGovtRegNo} placeholder="Registration Number" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Agency Code *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={govtAgencyCode} onChangeText={setGovtAgencyCode} placeholder="Kode Satker / Lembaga" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Official Decree Number (SK Pembentukan) *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={govtDecreeNo} onChangeText={setGovtDecreeNo} placeholder="Decree Number" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tax Number (NPWP Instansi) *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={govtNpwp} onChangeText={setGovtNpwp} placeholder="NPWP Instansi" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
        </View>

        {/* Card 3: Alamat */}
        <View style={styles.wizardCard}>
          <View style={styles.wizardCardHeader}>
            <Ionicons name="location-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
            <Text style={styles.wizardCardTitle}>Office Address</Text>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Office Address *</Text>
            <View style={[styles.inputContainer, { minHeight: 60, height: 'auto', paddingVertical: 10, alignItems: 'flex-start' }]}>
              <TextInput style={[styles.input, { textAlignVertical: 'top' }]} value={govtAddress} onChangeText={setGovtAddress} placeholder="Street Address" multiline placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>City *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={govtCity} onChangeText={setGovtCity} placeholder="City" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Province *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={govtProvince} onChangeText={setGovtProvince} placeholder="Province" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Postal Code *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={govtPostalCode} onChangeText={setGovtPostalCode} placeholder="Postal Code" keyboardType="numeric" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Country *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={govtCountry} onChangeText={setGovtCountry} placeholder="Country" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
        </View>

        {/* Card 4: Kontak */}
        <View style={styles.wizardCard}>
          <View style={styles.wizardCardHeader}>
            <Ionicons name="mail-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
            <Text style={styles.wizardCardTitle}>Contact Information</Text>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Official Email *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={govtEmail} onChangeText={setGovtEmail} placeholder="email@gov.go.id" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Official Phone Number *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={govtPhone} onChangeText={setGovtPhone} placeholder="Phone Number" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Website</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={govtWebsite} onChangeText={setGovtWebsite} placeholder="www.gov.go.id" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
        </View>

        {/* Card 5: Pejabat Penandatangan */}
        <View style={styles.wizardCard}>
          <View style={styles.wizardCardHeader}>
            <Ionicons name="person-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
            <Text style={styles.wizardCardTitle}>Signing Officer</Text>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={govtOfficerName} onChangeText={setGovtOfficerName} placeholder="Pejabat Name" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Position *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={govtOfficerPos} onChangeText={setGovtOfficerPos} placeholder="e.g. Kepala Dinas, Sekretaris Jenderal" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Employee Number (NIP) *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={govtOfficerNip}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  if (cleaned.length <= 18) setGovtOfficerNip(cleaned);
                }}
                keyboardType="numeric"
                maxLength={18}
                placeholder="NIP Number"
                placeholderTextColor={Theme.colors.placeholder}
              />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Rank/Golongan</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={govtOfficerRank} onChangeText={setGovtOfficerRank} placeholder="e.g. Pembina Utama / IV-e" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Appointment Decree Number</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={govtOfficerAppointNo} onChangeText={setGovtOfficerAppointNo} placeholder="Decree No" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Authority Basis *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={govtOfficerAuthorityBasis} onChangeText={setGovtOfficerAuthorityBasis} placeholder="e.g. PMK Nomor X, Perpres Nomor Y" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
        </View>

        {/* Card 6: Dokumen Legal Uploads */}
        <View style={styles.wizardCard}>
          <View style={styles.wizardCardHeader}>
            <Ionicons name="document-attach-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
            <Text style={styles.wizardCardTitle}>Legal Documents</Text>
          </View>
          <RealUploadField label="Establishment Decree" value={govtFileDecree} onChange={setGovtFileDecree} />
          <RealUploadField label="Officer Appointment Letter" value={govtFileAppoint} onChange={setGovtFileAppoint} />
          <RealUploadField label="Institution Tax Card (NPWP)" value={govtFileNpwp} onChange={setGovtFileNpwp} />
          <RealUploadField label="Other Supporting Documents" value={govtFileOther} onChange={setGovtFileOther} />
        </View>

        {/* Card 7: Data Tambahan */}
        <View style={styles.wizardCard}>
          <View style={styles.wizardCardHeader}>
            <Ionicons name="analytics-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
            <Text style={styles.wizardCardTitle}>Additional Data</Text>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Budget Year</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={govtBudgetYr} onChangeText={setGovtBudgetYr} placeholder="e.g. 2026" keyboardType="numeric" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Procurement Number</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={govtProcurementNo} onChangeText={setGovtProcurementNo} placeholder="e.g. SPSE-1002" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Government Project Number</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={govtProjectNo} onChangeText={setGovtProjectNo} placeholder="e.g. PRJ-2026" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Contract Package Number</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={govtContractPkgNo} onChangeText={setGovtContractPkgNo} placeholder="Contract Package" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderOrganizationForm = () => {
    return (
      <View>
        {/* Card 1: Informasi Organisasi */}
        <View style={styles.wizardCard}>
          <View style={styles.wizardCardHeader}>
            <Ionicons name="people-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
            <Text style={styles.wizardCardTitle}>Organization Information</Text>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Organization Name *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={orgName} onChangeText={setOrgName} placeholder="Organization/Foundation Name" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Organization Type *</Text>
            <View style={styles.segmentPickerRow}>
              {['Foundation', 'Association', 'NGO'].map((otype) => (
                <TouchableOpacity 
                  key={otype} 
                  style={[styles.segmentPickerBtn, orgType === otype && styles.segmentPickerBtnActive]} 
                  onPress={() => setOrgType(otype)}
                >
                  <Text style={[styles.segmentPickerText, orgType === otype && styles.segmentPickerTextActive]}>{otype}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={[styles.segmentPickerRow, { marginTop: 8 }]}>
              {['Community', 'Religious', 'Professional'].map((otype) => (
                <TouchableOpacity 
                  key={otype} 
                  style={[styles.segmentPickerBtn, orgType === otype && styles.segmentPickerBtnActive]} 
                  onPress={() => setOrgType(otype)}
                >
                  <Text style={[styles.segmentPickerText, orgType === otype && styles.segmentPickerTextActive]}>{otype}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={[styles.segmentPickerRow, { marginTop: 8 }]}>
              {['Educational', 'Other'].map((otype) => (
                <TouchableOpacity 
                  key={otype} 
                  style={[styles.segmentPickerBtn, orgType === otype && styles.segmentPickerBtnActive]} 
                  onPress={() => setOrgType(otype)}
                >
                  <Text style={[styles.segmentPickerText, orgType === otype && styles.segmentPickerTextActive]}>{otype}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Card 2: Legal Information */}
        <View style={styles.wizardCard}>
          <View style={styles.wizardCardHeader}>
            <Ionicons name="id-card-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
            <Text style={styles.wizardCardTitle}>Legal Information</Text>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Deed Number (Akta Pendirian) *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={orgDeedNo} onChangeText={setOrgDeedNo} placeholder="Akta Pendirian Number" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Deed Date</Text>
            <TouchableOpacity style={styles.inputContainer} onPress={() => openDatePicker('orgDeedDate', orgDeedDate)}>
              <Text style={[styles.input, !orgDeedDate && { color: Theme.colors.placeholder }]}>
                {orgDeedDate || 'Select Deed Date'}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#888888" style={{ marginRight: 10 }} />
            </TouchableOpacity>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Ministry Approval Number (SK Kemenkumham) *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={orgMinistryApprovalNo} onChangeText={setOrgMinistryApprovalNo} placeholder="SK Kemenkumham" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Registration Number *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={orgRegNo} onChangeText={setOrgRegNo} placeholder="Lembaga Registration Number" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tax Number (NPWP) *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={orgNpwp} onChangeText={setOrgNpwp} placeholder="NPWP Number" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
        </View>

        {/* Card 3: Address */}
        <View style={styles.wizardCard}>
          <View style={styles.wizardCardHeader}>
            <Ionicons name="location-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
            <Text style={styles.wizardCardTitle}>Address</Text>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Registered Address *</Text>
            <View style={[styles.inputContainer, { minHeight: 60, height: 'auto', paddingVertical: 10, alignItems: 'flex-start' }]}>
              <TextInput style={[styles.input, { textAlignVertical: 'top' }]} value={orgRegAddress} onChangeText={setOrgRegAddress} placeholder="Official registered address" multiline placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Operational Address</Text>
            <View style={[styles.inputContainer, { minHeight: 60, height: 'auto', paddingVertical: 10, alignItems: 'flex-start' }]}>
              <TextInput style={[styles.input, { textAlignVertical: 'top' }]} value={orgOpAddress} onChangeText={setOrgOpAddress} placeholder="Operational physical office address" multiline placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>City *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={orgCity} onChangeText={setOrgCity} placeholder="City" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Province *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={orgProvince} onChangeText={setOrgProvince} placeholder="Province" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Postal Code *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={orgPostalCode} onChangeText={setOrgPostalCode} placeholder="Postal Code" keyboardType="numeric" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Country *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={orgCountry} onChangeText={setOrgCountry} placeholder="Country" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
        </View>

        {/* Card 4: Kontak */}
        <View style={styles.wizardCard}>
          <View style={styles.wizardCardHeader}>
            <Ionicons name="mail-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
            <Text style={styles.wizardCardTitle}>Contact Information</Text>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Official Email *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={orgEmail} onChangeText={setOrgEmail} placeholder="email@organization.org" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={orgPhone} onChangeText={setOrgPhone} placeholder="Phone Number" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Website</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={orgWebsite} onChangeText={setOrgWebsite} placeholder="www.organization.org" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
        </View>

        {/* Card 5: Pengurus Organisasi (Multiple Entries list) */}
        <View style={styles.wizardCard}>
          <View style={styles.wizardCardHeader}>
            <Ionicons name="people-circle-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
            <Text style={styles.wizardCardTitle}>Board Members</Text>
          </View>

          {/* List of currently added board members */}
          {orgMembers.map((member) => (
            <View key={member.id} style={styles.memberCard}>
              <View style={styles.memberHeader}>
                <Text style={styles.memberName}>{member.name}</Text>
                <TouchableOpacity onPress={() => handleRemoveMember(member.id)}>
                  <Ionicons name="close-circle-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
              <Text style={styles.memberPosition}>{member.position}</Text>
              <Text style={styles.memberNik}>NIK: {member.nik}</Text>
              {(member.email || member.phone) && (
                <Text style={styles.memberNik}>
                  {member.email ? member.email : ''}{member.email && member.phone ? ' | ' : ''}{member.phone ? member.phone : ''}
                </Text>
              )}
            </View>
          ))}

          {orgMembers.length === 0 && (
            <Text style={[styles.uploadSubtext, { fontStyle: 'italic', marginBottom: 15 }]}>No board members added yet.</Text>
          )}

          {/* Dynamic add member button and drawer form */}
          {!showAddMemberForm ? (
            <TouchableOpacity 
              style={[styles.wizardButton, styles.prevButton, { height: 40, marginTop: 10 }]} 
              onPress={() => setShowAddMemberForm(true)}
            >
              <Text style={styles.prevButtonText}>+ Add Board Member</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.addMemberBox}>
              <View style={styles.addMemberHeader}>
                <Text style={styles.addMemberTitle}>New Board Member Details</Text>
                <TouchableOpacity onPress={() => setShowAddMemberForm(false)}>
                  <Text style={{ color: '#FF3B30', fontSize: 13, fontFamily: Theme.fonts.bold }}>Cancel</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <View style={styles.inputContainer}>
                  <TextInput style={styles.input} value={newMemberName} onChangeText={setNewMemberName} placeholder="Name" placeholderTextColor={Theme.colors.placeholder} />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Position *</Text>
                <View style={styles.inputContainer}>
                  <TextInput style={styles.input} value={newMemberPosition} onChangeText={setNewMemberPosition} placeholder="e.g. Chairman, Treasurer" placeholderTextColor={Theme.colors.placeholder} />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>NIK / ID Card Number *</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={newMemberNik}
                    onChangeText={(text) => {
                      const cleaned = text.replace(/[^0-9]/g, '');
                      if (cleaned.length <= 16) setNewMemberNik(cleaned);
                    }}
                    maxLength={16}
                    keyboardType="numeric"
                    placeholder="16-digit National NIK"
                    placeholderTextColor={Theme.colors.placeholder}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <TextInput style={styles.input} value={newMemberEmail} onChangeText={setNewMemberEmail} keyboardType="email-address" placeholder="email@domain.com" placeholderTextColor={Theme.colors.placeholder} />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.inputContainer}>
                  <TextInput style={styles.input} value={newMemberPhone} onChangeText={setNewMemberPhone} keyboardType="phone-pad" placeholder="Phone" placeholderTextColor={Theme.colors.placeholder} />
                </View>
              </View>

              <TouchableOpacity style={[styles.continueButton, { height: 44, marginTop: 10 }]} onPress={handleAddMember}>
                <Text style={styles.continueButtonText}>Save Member Entry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Card 6: Perwakilan yang Menandatangani */}
        <View style={styles.wizardCard}>
          <View style={styles.wizardCardHeader}>
            <Ionicons name="person-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
            <Text style={styles.wizardCardTitle}>Authorized Representative</Text>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Representative Name *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={orgRepName} onChangeText={setOrgRepName} placeholder="Representative's Name" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Position *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={orgRepPosition} onChangeText={setOrgRepPosition} placeholder="e.g. Chairman, Executive Director" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Authority Basis *</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={orgRepAuthorityBasis} onChangeText={setOrgRepAuthorityBasis} placeholder="e.g. Article 12 of AD/ART, Power of Attorney" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Appointment Date</Text>
            <TouchableOpacity style={styles.inputContainer} onPress={() => openDatePicker('orgRepAppointmentDate', orgRepAppointmentDate)}>
              <Text style={[styles.input, !orgRepAppointmentDate && { color: Theme.colors.placeholder }]}>
                {orgRepAppointmentDate || 'Select Appointment Date'}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#888888" style={{ marginRight: 10 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Card 7: Data Operasional */}
        <View style={styles.wizardCard}>
          <View style={styles.wizardCardHeader}>
            <Ionicons name="analytics-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
            <Text style={styles.wizardCardTitle}>Operational Data</Text>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Vision</Text>
            <View style={[styles.inputContainer, { minHeight: 60, height: 'auto', paddingVertical: 10, alignItems: 'flex-start' }]}>
              <TextInput style={[styles.input, { textAlignVertical: 'top' }]} value={orgVision} onChangeText={setOrgVision} placeholder="Organization Vision" multiline placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Mission</Text>
            <View style={[styles.inputContainer, { minHeight: 60, height: 'auto', paddingVertical: 10, alignItems: 'flex-start' }]}>
              <TextInput style={[styles.input, { textAlignVertical: 'top' }]} value={orgMission} onChangeText={setOrgMission} placeholder="Organization Mission" multiline placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Main Activities</Text>
            <View style={[styles.inputContainer, { minHeight: 60, height: 'auto', paddingVertical: 10, alignItems: 'flex-start' }]}>
              <TextInput style={[styles.input, { textAlignVertical: 'top' }]} value={orgMainActivities} onChangeText={setOrgMainActivities} placeholder="Describe main regular activities" multiline placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Number of Members</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={orgMemberCount} onChangeText={setOrgMemberCount} placeholder="Total members" keyboardType="numeric" placeholderTextColor={Theme.colors.placeholder} />
            </View>
          </View>
        </View>

        {/* Card 8: Dokumen Upload */}
        <View style={styles.wizardCard}>
          <View style={styles.wizardCardHeader}>
            <Ionicons name="document-attach-outline" size={20} color={Theme.colors.primary} style={styles.cardHeaderIcon} />
            <Text style={styles.wizardCardTitle}>Required Documents</Text>
          </View>
          <RealUploadField label="Deed of Establishment" value={orgFileDeed} onChange={setOrgFileDeed} />
          <RealUploadField label="Deed of Amendment" value={orgFileAmendment} onChange={setOrgFileAmendment} />
          <RealUploadField label="Ministry of Law Decree" value={orgFileMinistry} onChange={setOrgFileMinistry} />
          <RealUploadField label="Organization Tax Card (NPWP)" value={orgFileNpwp} onChange={setOrgFileNpwp} />
          <RealUploadField label="AD / ART (Articles of Association)" value={orgFileAdart} onChange={setOrgFileAdart} />
          <RealUploadField label="Power of Attorney (If Any)" value={orgFilePoa} onChange={setOrgFilePoa} />
        </View>
      </View>
    );
  };

  const renderClientProfileView = () => {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.headerBtn}>
            <Ionicons name="chevron-back" size={24} color={Theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Client Profile</Text>
          <TouchableOpacity onPress={handleHelp} style={styles.headerBtn}>
            <Ionicons name="help-circle-outline" size={24} color={Theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Dropdown Applicant Type - Dynamic Accordion */}
          <View style={styles.dropdownGroup}>
            <Text style={styles.label}>Applicant Type *</Text>
            <TouchableOpacity 
              style={styles.dropdownHeader} 
              onPress={() => setShowTypeDropdown(!showTypeDropdown)}
              activeOpacity={0.8}
            >
              <Text style={styles.dropdownHeaderText}>{applicantType}</Text>
              <Ionicons name={showTypeDropdown ? "chevron-up" : "chevron-down"} size={20} color={Theme.colors.primary} />
            </TouchableOpacity>
            
            {showTypeDropdown && (
              <View style={styles.dropdownOptionsContainer}>
                {['Individual', 'Company', 'Government', 'Organization'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.dropdownOptionBtn,
                      applicantType === type && styles.dropdownOptionBtnActive
                    ]}
                    onPress={() => {
                      setApplicantType(type);
                      setShowTypeDropdown(false);
                    }}
                  >
                    <Text style={[
                      styles.dropdownOptionText,
                      applicantType === type && styles.dropdownOptionTextActive
                    ]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* DYNAMIC FORMS BASED ON APPLICANT TYPE */}
          {applicantType === 'Individual' && renderIndividualForm()}
          {applicantType === 'Company' && renderCompanyForm()}
          {applicantType === 'Government' && renderGovernmentForm()}
          {applicantType === 'Organization' && renderOrganizationForm()}

          {/* Action Save Button */}
          {applicantType !== 'Individual' && applicantType !== 'Company' && (
            <TouchableOpacity style={styles.generateButton} onPress={handleSaveClientProfile} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-done" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.generateButtonText}>Save Client Profile</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Show dynamic save button inside components as well for consistency */}
          {(applicantType === 'Individual' || applicantType === 'Company') && (
            <TouchableOpacity style={styles.generateButton} onPress={handleSaveClientProfile} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-done" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.generateButtonText}>Save Client Profile</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
        {renderDatePickerOverlay()}
      </SafeAreaView>
    );
  };

  const renderMenuView = () => {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header - Flat with white background, no shadow */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.headerBtn}>
            <Ionicons name="chevron-back" size={24} color={Theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Document Generator</Text>
          <TouchableOpacity onPress={handleHelp} style={styles.headerBtn}>
            <Ionicons name="help-circle-outline" size={24} color={Theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Subheader */}
        <View style={styles.subheader}>
          <Text style={styles.caption}>
            Select a template and draft your professional legal document in minutes.
          </Text>
        </View>

        {/* Menu Cards */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Card 1: Contract Letter */}
          <TouchableOpacity 
            style={styles.menuCard}
            onPress={() => setSelectedMenuItem('contract')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBox, { backgroundColor: 'rgba(29, 80, 131, 0.1)' }]}>
              <Ionicons name="document-text" size={26} color={Theme.colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Contract Letter</Text>
              <Text style={styles.cardCaption}>Employment, service, or partnership agreements.</Text>
            </View>
            <Ionicons 
              name={selectedMenuItem === 'contract' ? "radio-button-on" : "radio-button-off"} 
              size={24} 
              color={selectedMenuItem === 'contract' ? Theme.colors.primary : "#CCCCCC"} 
            />
          </TouchableOpacity>

          {/* Card 2: Statement Letter */}
          <TouchableOpacity 
            style={styles.menuCard}
            onPress={() => setSelectedMenuItem('statement')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBox, { backgroundColor: 'rgba(29, 80, 131, 0.1)' }]}>
              <Ionicons name="create" size={26} color={Theme.colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Statement Letter</Text>
              <Text style={styles.cardCaption}>Formal declarations and official witness statements.</Text>
            </View>
            <Ionicons 
              name={selectedMenuItem === 'statement' ? "radio-button-on" : "radio-button-off"} 
              size={24} 
              color={selectedMenuItem === 'statement' ? Theme.colors.primary : "#CCCCCC"} 
            />
          </TouchableOpacity>

          {/* Card 3: Power of Attorney */}
          <TouchableOpacity 
            style={styles.menuCard}
            onPress={() => setSelectedMenuItem('poa')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBox, { backgroundColor: 'rgba(29, 80, 131, 0.1)' }]}>
              <Ionicons name="key" size={26} color={Theme.colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Power of Attorney</Text>
              <Text style={styles.cardCaption}>Legal authorization for representation and rights.</Text>
            </View>
            <Ionicons 
              name={selectedMenuItem === 'poa' ? "radio-button-on" : "radio-button-off"} 
              size={24} 
              color={selectedMenuItem === 'poa' ? Theme.colors.primary : "#CCCCCC"} 
            />
          </TouchableOpacity>

          {/* Card 4: Create Client Profile */}
          <TouchableOpacity 
            style={styles.menuCard}
            onPress={() => setSelectedMenuItem('client_profile')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBox, { backgroundColor: 'rgba(29, 80, 131, 0.1)' }]}>
              <Ionicons name="person-add" size={26} color={Theme.colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Create Client Profile</Text>
              <Text style={styles.cardCaption}>Set up a complete profile for legal representation.</Text>
            </View>
            <Ionicons 
              name={selectedMenuItem === 'client_profile' ? "radio-button-on" : "radio-button-off"} 
              size={24} 
              color={selectedMenuItem === 'client_profile' ? Theme.colors.primary : "#CCCCCC"} 
            />
          </TouchableOpacity>

          {/* Card 5: History & Draft (White background card) */}
          <TouchableOpacity 
            style={[styles.menuCard, styles.historyMenuCard]}
            onPress={() => setSelectedMenuItem('history')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBox, { backgroundColor: 'rgba(29, 80, 131, 0.1)' }]}>
              <Ionicons name="time" size={26} color={Theme.colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>History & Draft</Text>
              <Text style={styles.cardCaption}>Manage your generated documents and drafts.</Text>
            </View>
            <Ionicons 
              name={selectedMenuItem === 'history' ? "radio-button-on" : "radio-button-off"} 
              size={24} 
              color={selectedMenuItem === 'history' ? Theme.colors.primary : "#CCCCCC"} 
            />
          </TouchableOpacity>

          {/* Continue Button with spacing at the bottom of the list */}
          <View style={styles.continueBtnWrapper}>
            <TouchableOpacity 
              style={[
                styles.continueButton,
                !selectedMenuItem && styles.continueButtonDisabled
              ]}
              onPress={() => {
                if (selectedMenuItem === 'history') {
                  setCurrentView('history');
                } else if (selectedMenuItem === 'client_profile') {
                  setCurrentView('client_profile');
                } else {
                  handleSelectTemplate(selectedMenuItem);
                }
              }}
              disabled={!selectedMenuItem}
              activeOpacity={0.9}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>
    );
  };

  const getPreviewText = () => {
    if (selectedTemplate === 'contract') return getContractContent();
    if (selectedTemplate === 'statement') return getStatementContent();
    if (selectedTemplate === 'poa') return getPoaContent();
    return '';
  };

  const renderPreviewStep = () => {
    const text = getPreviewText();
    return (
      <View style={styles.formSection}>
        <Text style={styles.stepTitle}>Review & Verify</Text>
        <Text style={styles.stepSub}>Verify that all information is complete and accurate before generating.</Text>

        <View style={styles.previewScrollContainer}>
          <ScrollView style={styles.previewPaper} showsVerticalScrollIndicator={true}>
            <Text style={styles.previewPaperText}>{text}</Text>
            <View style={styles.sealIndicator}>
              <Ionicons name="shield-checkmark" size={16} color={Theme.colors.primary} />
              <Text style={styles.sealText}>Lawsy AI Sealed & Verified</Text>
            </View>
            <View style={{ height: 30 }} />
          </ScrollView>
        </View>

        <TouchableOpacity 
          style={styles.generateButton} 
          onPress={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="document-text-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.generateButtonText}>Generate & Save Document</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderProgressBar = () => {
    const steps = selectedTemplate === 'contract' 
      ? ['General', 'Scope', 'Value', 'Clauses', 'Signatures', 'Review']
      : selectedTemplate === 'statement' 
        ? ['Declarant', 'Content', 'Review']
        : ['Parties', 'Scope', 'Review'];

    const totalSteps = steps.length;
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressRow}>
          {steps.map((step, index) => {
            const stepNum = index + 1;
            const isActive = currentStep >= stepNum;
            
            return (
              <React.Fragment key={step}>
                {index > 0 && (
                  <View 
                    style={[
                      styles.progressLine,
                      isActive ? styles.progressLineActive : styles.progressLineInactive
                    ]} 
                  />
                )}
                <View style={styles.progressStepWrapper}>
                  <View 
                    style={[
                      styles.stepBubble,
                      isActive ? styles.stepBubbleActive : styles.stepBubbleInactive
                    ]}
                  >
                    <Text 
                      style={[
                        styles.stepBubbleText,
                        isActive ? styles.stepBubbleTextActive : styles.stepBubbleTextInactive
                      ]}
                    >
                      {stepNum}
                    </Text>
                  </View>
                  <Text 
                    style={[
                      styles.stepLabel,
                      isActive ? styles.stepLabelActive : styles.stepLabelInactive
                    ]}
                  >
                    {step}
                  </Text>
                </View>
              </React.Fragment>
            );
          })}
        </View>
      </View>
    );
  };

  const renderWizardView = () => {
    const totalSteps = selectedTemplate === 'contract' ? 6 
                     : selectedTemplate === 'statement' ? 3
                     : 3;

    const renderCurrentStepForm = () => {
      if (selectedTemplate === 'contract') return renderContractStep();
      if (selectedTemplate === 'statement') return renderStatementStep();
      if (selectedTemplate === 'poa') return renderPoaStep();
      return null;
    };

    const handleNext = () => {
      // Validations before moving to next step
      if (selectedTemplate === 'contract') {
        if (currentStep === 1) {
          if (!contractTitle || !contractNumber || !contractDate || !effectiveDate || !firstPartyProfileId || !secondPartyProfileId) {
            Alert.alert("Required Fields", "Please complete all required General Contract fields and select both Parties.");
            return;
          }
        } else if (currentStep === 2) {
          if (!contractPurpose || !scopeOfWork || !deliverables) {
            Alert.alert("Required Fields", "Please complete the Scope of Work details.");
            return;
          }
        } else if (currentStep === 3) {
          if (!contractValue || !paymentMethod) {
            Alert.alert("Required Fields", "Please enter the Contract Value and Payment Method.");
            return;
          }
        } else if (currentStep === 4) {
          if (!contractStartDate || !contractEndDate) {
            Alert.alert("Required Fields", "Please enter the Contract Duration dates.");
            return;
          }
        } else if (currentStep === 5) {
          if (!signatoryName || !signatoryPosition) {
            Alert.alert("Required Fields", "Please specify the Signatory details.");
            return;
          }
        }
      } else if (selectedTemplate === 'statement') {
        if (currentStep === 1) {
          if (!declarantName || !declarantId || !declarantAddress || !declarantOccupation || !statementDestination) {
            Alert.alert("Required Fields", "Please complete all Declarant, Occupation, and Destination details.");
            return;
          }
          if (declarantId.length !== 16 || isNaN(declarantId)) {
            Alert.alert("Invalid NIK", "Declarant NIK must be exactly 16 numeric digits.");
            return;
          }
        } else if (currentStep === 2) {
          if (!statementSubject || !statementText || !statementDate) {
            Alert.alert("Required Fields", "Please enter the Subject, Body Text, and Date of the Statement.");
            return;
          }
          if (needNotary && (!notaryName || !notaryOffice)) {
            Alert.alert("Required Fields", "Please complete Notary Name and Office details.");
            return;
          }
        }
      } else if (selectedTemplate === 'poa') {
        if (currentStep === 1) {
          if (!authorizerName || !authorizerId || !authorizerAddress || !authorizerOccupation || 
              !attorneyName || !attorneyId || !attorneyAddress || !attorneyEmail || !attorneyPhone) {
            Alert.alert("Required Fields", "Please enter all required Authorizer and Attorney details.");
            return;
          }
          if (authorizerId.length !== 16 || isNaN(authorizerId) || attorneyId.length !== 16 || isNaN(attorneyId)) {
            Alert.alert("Invalid NIK", "Both NIK fields must be exactly 16 numeric digits.");
            return;
          }
          if (poaType === 'Other' && !otherPoaType) {
            Alert.alert("Required Fields", "Please specify custom Power of Attorney type.");
            return;
          }
        } else if (currentStep === 2) {
          if (!poaEffectiveDate) {
            Alert.alert("Required Fields", "Please specify the POA Effective Date.");
            return;
          }
          if (poaObjectType === 'Property') {
            if (!poaPropertyCertificate || !poaPropertyAddress) {
              Alert.alert("Required Fields", "Please enter the Property Certificate Number and Address.");
              return;
            }
          } else if (poaObjectType === 'Vehicle') {
            if (!poaVehicleType || !poaVehiclePlate || !poaVehicleChassis || !poaVehicleEngine) {
              Alert.alert("Required Fields", "Please complete all target Vehicle details.");
              return;
            }
          } else if (poaObjectType === 'Company') {
            if (!poaCompanyName || !poaCompanyRegNo) {
              Alert.alert("Required Fields", "Please enter the target Company Name and Registration Number.");
              return;
            }
          }
        }
      }

      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    };

    const handlePrev = () => {
      if (currentStep > 1) {
        setCurrentStep(currentStep - 1);
      } else {
        handleBack();
      }
    };

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handlePrev} style={styles.headerBtn}>
            <Ionicons name="chevron-back" size={24} color={Theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {selectedTemplate === 'contract' ? 'Draft Contract' 
             : selectedTemplate === 'statement' ? 'Draft Statement' 
             : 'Draft Power of Attorney'}
          </Text>
          <TouchableOpacity onPress={handleHelp} style={styles.headerBtn}>
            <Ionicons name="help-circle-outline" size={24} color={Theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        {renderProgressBar()}

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {renderCurrentStepForm()}

          {/* Action Buttons */}
          {currentStep < totalSteps && (
            <View style={styles.wizardActionRow}>
              <TouchableOpacity style={[styles.wizardButton, styles.nextButton, { flex: 1 }]} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={{ height: 40 }} />
        </ScrollView>
        {renderDatePickerOverlay()}
      </SafeAreaView>
    );
  };

  const renderHistoryView = () => {
    const filteredItems = historyItems.filter(item => {
      const isTypeMatch = item.type === 'client_profile' || item.type === selectedTemplate || selectedTemplate === null;
      const isFilterMatch = activeFilter === 'History' 
        ? item.status === 'Completed'
        : item.status === 'Draft';
        
      const isSearchMatch = searchQuery === '' 
        ? true 
        : item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()));
          
      return isFilterMatch && isSearchMatch;
    });

    const handleDeleteItem = async (id) => {
      Alert.alert(
        "Delete Document",
        "Are you sure you want to permanently delete this legal draft from your history?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Delete", 
            style: "destructive", 
            onPress: async () => {
              const userStr = await AsyncStorage.getItem('user');
              const user = userStr ? JSON.parse(userStr) : null;
              
              if (user && !isNaN(id)) {
                try {
                  const response = await fetch(`${GENERATED_DOCUMENTS_API_URL}?action=delete&user_id=${user.id}&document_id=${id}`);
                  const resData = await response.json();
                  if (resData.status === 'success') {
                    await loadHistory();
                    return;
                  }
                } catch (e) {
                  console.error("Failed to delete from database", e);
                }
              }

              const updated = historyItems.filter(item => item.id !== id);
              setHistoryItems(updated);
              const storageKey = user ? `generated_documents_${user.id}` : 'generated_documents_guest';
              await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
            } 
          }
        ]
      );
    };

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.headerBtn}>
            <Ionicons name="chevron-back" size={24} color={Theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>History & Drafts</Text>
          <TouchableOpacity onPress={handleHelp} style={styles.headerBtn}>
            <Ionicons name="help-circle-outline" size={24} color={Theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Homepage style white shadow search bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#888888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search document name or content..."
              placeholderTextColor="#A0A0A0"
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#888888" />
              </TouchableOpacity>
            )}
          </View>

          {/* Connected segmented filter buttons */}
          <View style={styles.segmentedContainer}>
            <TouchableOpacity 
              style={[
                styles.segmentBtn, 
                styles.segmentBtnLeft,
                activeFilter === 'History' && styles.segmentBtnActive
              ]}
              onPress={() => setActiveFilter('History')}
            >
              <Text 
                style={[
                  styles.segmentText,
                  activeFilter === 'History' && styles.segmentTextActive
                ]}
              >
                History
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.segmentBtn, 
                styles.segmentBtnRight,
                activeFilter === 'Draft' && styles.segmentBtnActive
              ]}
              onPress={() => setActiveFilter('Draft')}
            >
              <Text 
                style={[
                  styles.segmentText,
                  activeFilter === 'Draft' && styles.segmentTextActive
                ]}
              >
                Draft
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {filteredItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.historyCard}
              onPress={() => {
                setSelectedDoc(item);
                setCurrentView('document_detail');
              }}
              activeOpacity={0.8}
            >
              <View 
                style={[
                  styles.historyIconCircle, 
                  { backgroundColor: 'rgba(29, 80, 131, 0.1)' }
                ]}
              >
                <Ionicons 
                  name={
                    item.type === 'contract' ? "document-text" 
                    : item.type === 'statement' ? "create" 
                    : item.type === 'poa' ? "key" 
                    : "person-add"
                  } 
                  size={22} 
                  color={Theme.colors.primary} 
                />
              </View>
              <View style={styles.historyInfo}>
                <Text style={styles.historyTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.historyMeta}>
                  {item.date} | {item.type.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
              <View style={styles.historyBadgeColumn}>
                <View 
                  style={[
                    styles.statusBadge, 
                    item.status === 'Completed' ? styles.statusCompleted : styles.statusDraft
                  ]}
                >
                  <Text 
                    style={[
                      styles.statusText,
                      { color: item.status === 'Completed' ? '#2E7D32' : '#E65100' }
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => handleDeleteItem(item.id)}
                  style={styles.deleteMiniBtn}
                >
                  <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}

          {filteredItems.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={54} color="#CCCCCC" />
              <Text style={styles.emptyTitle}>No Documents Found</Text>
              <Text style={styles.emptySub}>No legal drafts match your active filter or search.</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  };

  const renderDocumentDetailView = () => {
    if (!selectedDoc) return null;

    const generatePdfHtml = (docTitle, docContent) => {
      const escapedContent = docContent
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${docTitle}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
            body {
              font-family: 'Poppins', 'Helvetica Neue', Arial, sans-serif;
              margin: 0;
              padding: 40px;
              color: #333333;
              background-color: #ffffff;
              font-size: 14px;
              line-height: 1.6;
            }
            .monograph-container {
              border: 2px solid #1D5083;
              padding: 30px;
              border-radius: 8px;
              background-color: #fafafa;
              min-height: 90vh;
              position: relative;
            }
            .header-seal {
              text-align: right;
              font-size: 11px;
              color: #1D5083;
              font-weight: 600;
              margin-bottom: 20px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .legal-content {
              font-family: 'Courier New', Courier, monospace;
              font-size: 12px;
              white-space: pre-wrap;
              color: #222222;
              line-height: 1.8;
              margin-bottom: 40px;
            }
            .footer-logo {
              text-align: center;
              font-size: 12px;
              color: #1D5083;
              font-weight: 500;
              margin-top: 30px;
              border-top: 1px solid #e0e0e0;
              padding-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="monograph-container">
            <div class="header-seal">Lawsy Legal AI Verified &amp; Sealed</div>
            <div class="legal-content">${escapedContent}</div>
            <div class="footer-logo">Lawsy Legal Platform - Sealed Draft</div>
          </div>
        </body>
        </html>
      `;
    };

    const handleShare = async () => {
      try {
        setLoading(true);
        const html = generatePdfHtml(selectedDoc.title, selectedDoc.content);
        const { uri } = await Print.printToFileAsync({ html });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: `Share ${selectedDoc.title}`,
            UTI: 'com.adobe.pdf'
          });
        } else {
          Alert.alert("Sharing Unavailable", "Sharing is not available on this device.");
        }
      } catch (err) {
        console.error("Failed to share PDF", err);
        Alert.alert("Error", "Failed to generate and share PDF.");
      } finally {
        setLoading(false);
      }
    };

    const handleDownload = async () => {
      try {
        setLoading(true);
        const html = generatePdfHtml(selectedDoc.title, selectedDoc.content);
        const { uri } = await Print.printToFileAsync({ html });
        
        const filename = `${selectedDoc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        const destUri = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.copyAsync({
          from: uri,
          to: destUri
        });

        Alert.alert(
          "Download Complete",
          `The legal document has been saved to your device files as:\n${filename}`,
          [
            {
              text: "Open / Save As",
              onPress: async () => {
                if (await Sharing.isAvailableAsync()) {
                  await Sharing.shareAsync(destUri, {
                    mimeType: 'application/pdf',
                    dialogTitle: `Save ${selectedDoc.title}`,
                    UTI: 'com.adobe.pdf'
                  });
                }
              }
            },
            { text: "OK" }
          ]
        );
      } catch (err) {
        console.error("Failed to download PDF", err);
        Alert.alert("Error", "Failed to download PDF.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setCurrentView('history')} style={styles.headerBtn}>
            <Ionicons name="chevron-back" size={24} color={Theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{selectedDoc.title}</Text>
          <TouchableOpacity onPress={handleHelp} style={styles.headerBtn}>
            <Ionicons name="help-circle-outline" size={24} color={Theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.stepSub}>Generated on {selectedDoc.date} | Sealed by Lawsy Legal AI Engine</Text>

          <View style={[styles.previewScrollContainer, { height: 420 }]}>
            <ScrollView style={styles.previewPaper} showsVerticalScrollIndicator={true}>
              <Text style={styles.previewPaperText}>{selectedDoc.content}</Text>
              <View style={styles.sealIndicator}>
                <Ionicons name="shield-checkmark" size={16} color={Theme.colors.primary} />
                <Text style={styles.sealText}>Lawsy AI Sealed & Verified</Text>
              </View>
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>

          {/* Action Row */}
          <View style={styles.wizardActionRow}>
            <TouchableOpacity style={[styles.wizardButton, styles.prevButton, { flexDirection: 'row', gap: 6 }]} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={18} color="#666666" style={{ marginRight: 2 }} />
              <Text style={styles.prevButtonText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.wizardButton, styles.nextButton, { flexDirection: 'row', gap: 6 }]} onPress={handleDownload}>
              <Ionicons name="download-outline" size={18} color="#FFFFFF" style={{ marginRight: 2 }} />
              <Text style={styles.nextButtonText}>Download PDF</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };

  if (currentView === 'wizard') return renderWizardView();
  if (currentView === 'history') return renderHistoryView();
  if (currentView === 'document_detail') return renderDocumentDetailView();
  if (currentView === 'client_profile') return renderClientProfileView();
  return renderMenuView();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Putih background
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Theme.fonts.medium,
    fontSize: 20, 
    color: Theme.colors.primary,
    flex: 1,
    textAlign: 'center',
  },
  subheader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  caption: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  historyMenuCard: {
    backgroundColor: '#FFFFFF', 
    borderWidth: 1,
    borderColor: 'rgba(29, 80, 131, 0.15)',
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
    marginBottom: 4,
  },
  cardCaption: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: '#888888',
    lineHeight: 16,
  },
  
  // Custom dropdown selection component styles
  dropdownGroup: {
    marginBottom: 20,
    marginTop: 10,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 52,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dropdownHeaderText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.text,
  },
  dropdownOptionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  dropdownOptionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  dropdownOptionBtnActive: {
    backgroundColor: 'rgba(29, 80, 131, 0.05)',
  },
  dropdownOptionText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
  },
  dropdownOptionTextActive: {
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.primary,
  },

  // Segment picker styles
  segmentPickerRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  segmentPickerBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  segmentPickerBtnActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  segmentPickerText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 13,
    color: '#666666',
  },
  segmentPickerTextActive: {
    color: '#FFFFFF',
    fontFamily: Theme.fonts.bold,
  },

  // Mock Upload Fields
  uploadGroup: {
    marginBottom: 16,
  },
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Theme.colors.primary,
    minHeight: 65,
  },
  uploadBoxSuccess: {
    borderStyle: 'solid',
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  uploadText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.primary,
    marginBottom: 2,
  },
  uploadTextSuccess: {
    color: '#2E7D32',
    fontFamily: Theme.fonts.bold,
  },
  uploadSubtext: {
    fontFamily: Theme.fonts.regular,
    fontSize: 11,
    color: '#888888',
  },

  // Dynamic board member cards
  memberCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.text,
  },
  memberPosition: {
    fontFamily: Theme.fonts.medium,
    fontSize: 12,
    color: Theme.colors.primary,
    marginBottom: 2,
  },
  memberNik: {
    fontFamily: Theme.fonts.regular,
    fontSize: 11,
    color: '#666666',
  },
  addMemberBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addMemberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addMemberTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.primary,
  },

  // Continue Button
  continueBtnWrapper: {
    marginTop: 20,
    marginBottom: 10,
  },
  continueButton: {
    backgroundColor: Theme.colors.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  
  // Wizard progress bar styles - Larger, Flat, no shadow, spaced further
  progressContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 25,
    elevation: 0,
    shadowOpacity: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  progressStepWrapper: {
    alignItems: 'center',
    width: 70, // Uniform width for perfect centering
  },
  stepBubble: {
    width: 38, // Enlarged step bubbles
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBubbleActive: {
    backgroundColor: Theme.colors.primary,
  },
  stepBubbleInactive: {
    backgroundColor: '#E5E7EB',
  },
  stepBubbleText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
  },
  stepBubbleTextActive: {
    color: '#FFFFFF',
  },
  stepBubbleTextInactive: {
    color: '#9CA3AF',
  },
  stepLabel: {
    fontFamily: Theme.fonts.medium,
    fontSize: 11,
    marginTop: 8,
  },
  stepLabelActive: {
    color: Theme.colors.primary,
  },
  stepLabelInactive: {
    color: '#9CA3AF',
  },
  progressLine: {
    height: 3,
    flex: 1, // Dynamically fill the space between steps
    marginHorizontal: -10, // Pull closer to the bubble edges
    marginBottom: 20, // Align with bubble centers (since label is underneath)
  },
  progressLineActive: {
    backgroundColor: Theme.colors.primary,
  },
  progressLineInactive: {
    backgroundColor: '#E5E7EB',
  },
  
  // Form Screen Styles
  formSection: {
    marginTop: 20,
  },
  stepTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 22, 
    color: Theme.colors.primary,
    marginBottom: 6,
  },
  stepSub: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: '#666666',
    marginBottom: 20,
  },
  
  // Custom Card Layout for Form Steps
  wizardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  wizardCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 10,
  },
  cardHeaderIcon: {
    marginRight: 10,
  },
  wizardCardTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 15,
    color: Theme.colors.primary,
  },
  
  // Checkbox row
  checkboxRowWrapper: {
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  checkboxLabel: {
    fontFamily: Theme.fonts.medium,
    fontSize: 13,
    color: Theme.colors.text,
    marginLeft: 8,
  },
  
  // Character counter
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  charCounter: {
    fontFamily: Theme.fonts.regular,
    fontSize: 11,
    color: '#888888',
  },
  
  sectionSubtitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.primary,
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontFamily: Theme.fonts.medium,
    fontSize: 13,
    color: Theme.colors.text,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
  },
  currencyPrefix: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.text,
    marginRight: 6,
  },
  scopeSelectionRow: {
    flexDirection: 'column',
    gap: 8,
  },
  scopeOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  scopeOptionActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  scopeOptionText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 13,
    color: Theme.colors.text,
  },
  scopeOptionTextActive: {
    color: '#FFFFFF',
  },
  
  // Wizard actions
  wizardActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    gap: 12,
  },
  wizardButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  prevButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  prevButtonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 15,
    color: '#666666',
  },
  nextButton: {
    flex: 2,
    backgroundColor: Theme.colors.primary,
  },
  nextButtonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  
  // Preview paper
  previewScrollContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    height: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  previewPaper: {
    flex: 1,
    padding: 20,
  },
  previewPaperText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    lineHeight: 18,
    color: '#333333',
  },
  sealIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    gap: 6,
  },
  sealText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 11,
    color: Theme.colors.primary,
  },
  
  // History list styles - homepage style white card shadow search
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', 
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, 
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
  },
  
  // Connected segmented filter buttons
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    height: 48,
    padding: 4,
    marginTop: 15,
  },
  segmentBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  segmentBtnLeft: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  segmentBtnRight: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: Theme.colors.primary,
  },
  segmentText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: '#888888',
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontFamily: Theme.fonts.bold,
  },
  
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  historyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.text,
    marginBottom: 4,
  },
  historyMeta: {
    fontFamily: Theme.fonts.regular,
    fontSize: 11,
    color: '#888888',
  },
  historyBadgeColumn: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusCompleted: {
    backgroundColor: '#E8F5E9',
  },
  statusDraft: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 10,
    color: '#2E7D32',
  },
  deleteMiniBtn: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: '#555555',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySub: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  
  // Document details buttons
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.primary,
    height: 52,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  generateButtonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  
  // Dropdown Styles
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginTop: 6,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(29, 80, 131, 0.05)',
  },
  dropdownItemText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: '#374151',
  },
  dropdownItemTextActive: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.medium,
  },
  
  // iOS DateTimePicker Modal Styles
  iosModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  iosModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  iosModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  iosModalCancelText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 16,
    color: '#666666',
  },
  iosModalTitle: {
    fontFamily: Theme.fonts.medium,
    fontSize: 16,
    color: Theme.colors.primary,
  },
  iosModalDoneText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 16,
    color: Theme.colors.primary,
  },
});
