package org.workshop.momentummosaicapp.fitness;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.workshop.momentummosaicapp.user.User;
import org.workshop.momentummosaicapp.user.UserRepository;
import org.workshop.momentummosaicapp.utility.exception.ResourceNotFoundException;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FitnessServiceImpl implements FitnessService {

    private final DailyFitnessLogRepository fitnessLogRepository;
    private final UserRepository userRepository;
    @Override
    public void markWorkoutToday(Long userId, boolean didWorkout) {
        User user = getUserOrThrow(userId);
        DailyFitnessLog todaylog = getOrCreateTodayLog(user);
        todaylog.setDidWorkout(didWorkout);
        fitnessLogRepository.save(todaylog);
    }

    @Override
    public int getTotalWorkoutDays(Long userId) {
        getUserOrThrow(userId);
        List<DailyFitnessLog> logs = fitnessLogRepository.findByUserId(userId);

        return (int)logs.stream().filter(DailyFitnessLog::isDidWorkout).count();
    }

    @Override
    public int getWorkoutStreak(Long userId) {
        int streak=0;
        List<DailyFitnessLog> dailyFitnessLogs = fitnessLogRepository.findByUserId(userId);
        dailyFitnessLogs.sort(Comparator.comparing(DailyFitnessLog::getDate).reversed());
        LocalDate currentDate = LocalDate.now();
        for (DailyFitnessLog log: dailyFitnessLogs){
            if(log.getDate().equals(currentDate) && log.isDidWorkout()){
                streak++;
                currentDate = currentDate.minusDays(1);
            }else {
                break;
            }
        }
        return streak;
    }

    @Override
    public Optional<DailyFitnessLog> getTodayLog(Long userId) {
        getUserOrThrow(userId);

        return fitnessLogRepository.findByUserIdAndDate(userId,LocalDate.now());
    }
    private User getUserOrThrow(Long userId){
        return userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User Not Found"));
    }

    private DailyFitnessLog getOrCreateTodayLog(User user){
        Optional<DailyFitnessLog> todayLog = getTodayLog(user.getId());
        if (todayLog.isPresent()) return todayLog.get();

        DailyFitnessLog log = new DailyFitnessLog();
        log.setUser(user);
        log.setDate(LocalDate.now());
        log.setDidWorkout(false);
        return fitnessLogRepository.save(log);
    }

}
