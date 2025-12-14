package org.workshop.momentummosaicapp.fitness;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.workshop.momentummosaicapp.user.AppUser;
import org.workshop.momentummosaicapp.user.AppUserRepository;
import org.workshop.momentummosaicapp.utility.exception.ResourceNotFoundException;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FitnessServiceImpl implements FitnessService {

    private final DailyFitnessLogRepository fitnessLogRepository;
    private final AppUserRepository appUserRepository;
    @Override
    public void markWorkoutToday(Long userId, boolean didWorkout) {
        AppUser appUser = getUserOrThrow(userId);
        DailyFitnessLog todaylog = getOrCreateTodayLog(appUser);
        todaylog.setDidWorkout(didWorkout);
        fitnessLogRepository.save(todaylog);
    }

    @Override
    public int getTotalWorkoutDays(Long userId) {
        getUserOrThrow(userId);
        List<DailyFitnessLog> logs = fitnessLogRepository.findByAppUserId(userId);

        return (int)logs.stream().filter(DailyFitnessLog::isDidWorkout).count();
    }

    @Override
    public int getWorkoutStreak(Long userId) {
        int streak=0;
        List<DailyFitnessLog> dailyFitnessLogs = fitnessLogRepository.findByAppUserId(userId);
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

        return fitnessLogRepository.findByAppUserIdAndDate(userId,LocalDate.now());
    }
    private AppUser getUserOrThrow(Long userId){
        return appUserRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User Not Found"));
    }

    private DailyFitnessLog getOrCreateTodayLog(AppUser appUser){
        Optional<DailyFitnessLog> todayLog = getTodayLog(appUser.getId());
        if (todayLog.isPresent()) return todayLog.get();

        DailyFitnessLog log = new DailyFitnessLog();
        log.setAppUser(appUser);
        log.setDate(LocalDate.now());
        log.setDidWorkout(false);
        return fitnessLogRepository.save(log);
    }

}
