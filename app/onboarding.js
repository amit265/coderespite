import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import SafeScreen from '../components/SafeScreen';
import { EmojiText } from '../constants/constants';
import { updateUserData } from '../services/userStorage';
import analytics from '@react-native-firebase/analytics';
import LottieView from 'lottie-react-native';
import { CustomAlert } from "../components/shared/GlobalAlert";

const GOALS = [
  { id: 'web', label: 'Web Development', icon: '🌐' },
  { id: 'app', label: 'Mobile Apps', icon: '📱' },
  { id: 'data', label: 'Data & AI', icon: '🤖' },
  { id: 'dsa', label: 'Interviews & DSA', icon: '💼' }
];

const EXPERIENCE = [
  { id: 'beginner', label: 'Beginner', desc: 'I am completely new to coding.' },
  { id: 'intermediate', label: 'Intermediate', desc: 'I know some basics, want to level up.' },
  { id: 'advanced', label: 'Advanced', desc: 'I am a pro looking for quick refreshers.' }
];

const TIME = [
  { id: 5, label: '5 min / day', desc: 'Casual learning' },
  { id: 15, label: '15 min / day', desc: 'Regular habit' },
  { id: 30, label: '30+ min / day', desc: 'Intensive focus' }
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({
    goal: null,
    experience: null,
    time: null,
  });

  const nextStep = () => {
    if (step === 1 && !selections.goal) return CustomAlert.alert('Wait!', 'Please select a goal.');
    if (step === 2 && !selections.experience) return CustomAlert.alert('Wait!', 'Please select your experience level.');
    if (step === 3 && !selections.time) return CustomAlert.alert('Wait!', 'Please select a daily goal.');
    
    if (step < 4) {
      setStep(step + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    try {
      await updateUserData((data) => {
        data.profile.firstTime = false;
        data.profile.goal = selections.goal;
        data.profile.experience = selections.experience;
        data.profile.dailyGoalMins = selections.time;
        return data;
      });
      await analytics().logEvent('completed_onboarding');
      router.replace('(tabs)');
    } catch (e) {
      console.log('Error finishing onboarding', e);
      router.replace('(tabs)');
    }
  };

  const renderStep1 = () => (
    <View className="flex-1 w-full justify-center">
      <EmojiText className="text-3xl font-quicksand-bold text-center mb-8 text-[#0C1D59]">
        What&apos;s your goal? 🎯
      </EmojiText>
      <View className="gap-4">
        {GOALS.map(item => (
          <TouchableOpacity 
            key={item.id}
            onPress={() => setSelections({...selections, goal: item.id})}
            style={{
              backgroundColor: selections.goal === item.id ? '#132F94' : '#fff',
              borderColor: '#132F94',
              borderWidth: 2,
            }}
            className="p-5 rounded-2xl flex-row items-center justify-between"
          >
            <Text className={`text-lg font-nunito-semiBold ${selections.goal === item.id ? 'text-white' : 'text-[#132F94]'}`}>
              {item.label}
            </Text>
            <EmojiText className="text-2xl">{item.icon}</EmojiText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View className="flex-1 w-full justify-center">
      <EmojiText className="text-3xl font-quicksand-bold text-center mb-8 text-[#0C1D59]">
        Your experience? 🎓
      </EmojiText>
      <View className="gap-4">
        {EXPERIENCE.map(item => (
          <TouchableOpacity 
            key={item.id}
            onPress={() => setSelections({...selections, experience: item.id})}
            style={{
              backgroundColor: selections.experience === item.id ? '#132F94' : '#fff',
              borderColor: '#132F94',
              borderWidth: 2,
            }}
            className="p-5 rounded-2xl"
          >
            <Text className={`text-lg font-nunito-semiBold ${selections.experience === item.id ? 'text-white' : 'text-[#132F94]'}`}>
              {item.label}
            </Text>
            <Text className={`text-sm font-nunito mt-1 ${selections.experience === item.id ? 'text-blue-200' : 'text-gray-500'}`}>
              {item.desc}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View className="flex-1 w-full justify-center">
      <EmojiText className="text-3xl font-quicksand-bold text-center mb-8 text-[#0C1D59]">
        Daily commitment? ⏱️
      </EmojiText>
      <View className="gap-4">
        {TIME.map(item => (
          <TouchableOpacity 
            key={item.id}
            onPress={() => setSelections({...selections, time: item.id})}
            style={{
              backgroundColor: selections.time === item.id ? '#132F94' : '#fff',
              borderColor: '#132F94',
              borderWidth: 2,
            }}
            className="p-5 rounded-2xl flex-row items-center justify-between"
          >
            <View>
              <Text className={`text-lg font-nunito-semiBold ${selections.time === item.id ? 'text-white' : 'text-[#132F94]'}`}>
                {item.label}
              </Text>
              <Text className={`text-sm font-nunito mt-1 ${selections.time === item.id ? 'text-blue-200' : 'text-gray-500'}`}>
                {item.desc}
              </Text>
            </View>
            <Text className={`text-2xl ${selections.time === item.id ? 'text-white' : 'text-[#132F94]'}`}>
              🔥
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View className="flex-1 w-full justify-center items-center">
      <LottieView
        source={require("../assets/cat.json")}
        autoPlay
        loop
        style={{ height: 200, width: 200, marginBottom: 20 }}
      />
      <EmojiText className="text-3xl font-quicksand-bold text-center mb-4 text-[#0C1D59]">
        You&apos;re all set! 🚀
      </EmojiText>
      <Text className="text-lg font-nunito text-center text-gray-600 px-6">
        We&apos;ve personalized CodeRespite based on your goals. Let&apos;s start building your coding streak!
      </Text>
    </View>
  );

  return (
    <SafeScreen>
      <View className="flex-1 bg-[#CBE7F7] px-6">
        
        {/* Progress Bar */}
        <View className="h-2 bg-blue-200 rounded-full w-full mt-4 flex-row overflow-hidden">
          <View style={{ width: `${(step / 4) * 100}%` }} className="h-full bg-[#132F94]" />
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </ScrollView>

        <View className="pb-8 pt-4">
          <TouchableOpacity 
            onPress={nextStep}
            className="bg-[#FFA500] w-full py-4 rounded-full items-center justify-center shadow-md"
          >
            <Text className="text-[#0C1D59] font-quicksand-bold text-xl">
              {step === 4 ? "Let's Go!" : "Continue"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeScreen>
  );
}
